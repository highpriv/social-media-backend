const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middlewares/authMiddleware");
const uploadMultipleImages = require('../middlewares/multerMiddleware');
const { publishPost, getAllPosts } = require("../controllers/postController");

router.post(
  "/publish",
  [authenticateMiddleware, uploadMultipleImages],
  publishPost
);

router.get(
    "/",
    [authenticateMiddleware],
    getAllPosts
  );

module.exports = router;
