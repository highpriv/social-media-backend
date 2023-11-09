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

      const images = req.files?.map((image) =>
        uploadImageToS3(image)
      );

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

    }
    catch (error) {
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

      const posts = await ProfilePosts.find({}).populate("user").sort({ createdAt: -1 });

      return res.status(200).send({
        message: "Paylaşımlar başarıyla getirildi.",
        publications: posts,
      });

    }
    catch (error) {
      console.log(error);
      res.status(400).send("Paylaşımlar getirilirken bir hata meydana geldi.");
    }

  } 
};

module.exports = controller;
