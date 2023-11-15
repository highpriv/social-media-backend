const { uploadImageToS3 } = require("../services/uploadService");
const Users = require("../models/User");
const ProfilePosts = require("../models/ProfilePosts");

const controller = {
  async publishPost(req, res) {
    const currentUserId = req?.user?._id;

    if (!currentUserId) {
      return res.status(400).send("Eksik parametre.");
    }

    try {
      const user = await Users.findById(currentUserId);

      if (!user) {
        return res.status(404).send("Kullanıcı bulunamadı.");
      }

      const { content } = req.body;

      const images = req.files?.map((image) => uploadImageToS3(image));

      const newPost = {
        content,
        userID: currentUserId,
        images: images ? await Promise.all(images) : [],
      };

      const post = await ProfilePosts.create(newPost);

      user.publications.push(post._id);

      await user.save();

      return res.status(200).send({
        message: "Paylaşım başarıyla oluşturuldu.",
        publications: post,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("Paylaşım yapılırken bir hata meydana geldi.");
    }
  },

  async getAllPosts(req, res) {
    const currentUserId = req?.user?._id;

    if (!currentUserId) {
      return res.status(400).send("Eksik parametre.");
    }

    try {
      const user = await Users.findById(currentUserId);

      if (!user) {
        return res.status(404).send("Kullanıcı bulunamadı.");
      }

      const posts = await ProfilePosts.find({})
        .populate("user")
        .sort({ createdAt: -1 });

      return res.status(200).send({
        message: "Paylaşımlar başarıyla getirildi.",
        publications: posts,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("Paylaşımlar getirilirken bir hata meydana geldi.");
    }
  },

  async contentActionHandler(req, res) {
    const { contentId } = req.params;
    const { action } = req.body;

    const { _id } = req.user;

    try {
      const findPost = await ProfilePosts.findById(contentId).populate(
        "userID",
        "name lastname username"
      );
      if (!findPost) {
        return res.status(404).json({ error: "İçerik bulunamadı." });
      }

      switch (action) {
        case "like":
          if (findPost.likes.includes(_id)) {
            findPost.likes = findPost.likes.filter(
              (id) => id.toString() !== _id
            );
          } else {
            findPost.likes.push(_id);
          }
          break;
        case "bookmark":
          if (findPost.savedBy.includes(_id)) {
            findPost.savedBy = findPost.savedBy.filter(
              (id) => id.toString() !== _id
            );
          } else {
            findPost.savedBy.push(_id);
          }
          break;
        default:
          break;
      }

      await findPost.save();

      res.status(200).json({ message: "İçerik güncellendi.", post: findPost });
    } catch (err) {
      return res.status(500).json({ error: "Bir hata oluştu." });
    }
  },
};

module.exports = controller;
