const { uploadImageToS3 } = require("../services/uploadService");
const Users = require("../models/User");
const ProfilePosts = require("../models/ProfilePosts");
const dtos = require("../utils/dtos/index");
const controller = {
  async getUser(req, res) {
    const { username } = req.params;
    try {
      const user = await Users.findOne({ username })
        .populate(
          "createdContents",
          "title slug summary thumbnail likedBy savedBy"
        )
        .populate("publications", "content images likes createdAt")
        .exec()
        .catch((err) => {
          console.log("hataaaaa", err);
        });

      if (!user) {
        res.status(404).send("Kullanıcı bulunamadı.");
      }
      const userDto = dtos.userDto(user);
      res.status(200).json(userDto);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .send("Kullanıcı bilgileri getirilirken bir hata meydana geldi.");
    }
  },

  async getUsers(req, res, next) {
    try {
      const page = req.query.page || 1;
      const limit = 10;

      const currentUserId = req?.user?._id;

      const getUsers = await Users.find({})
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ userFollowers: -1 });
      const count = await Users.countDocuments({});
      const users = getUsers.map((user) => {
        user.isFollowing = user?.userFollowers?.includes(currentUserId);
        const userDto = dtos.userDto(user);
        return userDto;
      });
      res.status(200).json({ users, count });
    } catch (error) {
      console.log(error);
      res.status(400).send("Kullanıcılar getirilirken bir hata meydana geldi.");
    }
  },

  async followUser(req, res) {
    const { userId } = req.params;
    const currentUserId = req?.user?._id;

    if (!userId || !currentUserId) {
      return res.status(400).send("Eksik parametre.");
    }

    try {
      if (userId === currentUserId) {
        return res.status(400).send("Kendini takip edemezsin.");
      }

      const reciepentUser = await Users.findById(userId);
      const currentUser = await Users.findById(currentUserId);

      if (!reciepentUser || !currentUser) {
        return res.status(404).send("Kullanıcı bulunamadı.");
      }

      const isFollowing = reciepentUser.userFollowers.includes(currentUserId);

      if (isFollowing) {
        reciepentUser.userFollowers.pull(currentUserId);
        currentUser.following.pull(userId);
        await reciepentUser.save();
        await currentUser.save();
        return res.status(200).send(reciepentUser);
      } else {
        reciepentUser.userFollowers.push(currentUserId);
        currentUser.following.push(userId);
        await reciepentUser.save();
        await currentUser.save();
        return res.status(200).send(reciepentUser);
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("Kullanıcı takip edilirken bir hata meydana geldi.");
    }
  },

  async getUser(req, res) {
    const { username } = req.params;
    try {
      const user = await Users.findOne({ username })
        .populate("publications", "content images likes createdAt")
        .exec()
        .catch((err) => {
          console.log("hataaaaa", err);
        });

      if (!user) {
        res.status(404).send({ error: "Kullanıcı bulunamadı." });
      }
      const userDto = dtos.userDto(user);
      res.status(200).json(userDto);
    } catch (error) {
      console.log(error);
      res
        .status(400)
        .send("Kullanıcı bilgileri getirilirken bir hata meydana geldi.");
    }
  },
};
module.exports = controller;
