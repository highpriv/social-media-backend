const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middlewares/authMiddleware");
const uploadMultipleImages = require("../middlewares/multerMiddleware");
const {
  publishPost,
  getAllPosts,
  contentActionHandler,
} = require("../controllers/postController");

router.post(
  "/publish",
  [authenticateMiddleware, uploadMultipleImages],
  publishPost
);

router.get("/", [authenticateMiddleware], getAllPosts);

router.post("/action/:contentId", authenticateMiddleware, contentActionHandler);

module.exports = router;
