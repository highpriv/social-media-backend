const express = require("express");
const router = express.Router();
const authenticateMiddleware = require("../middlewares/authMiddleware");
const { UserController } = require("../controllers");

router.get("/", authenticateMiddleware, UserController.getUsers);
router.post(
  "/follow/:userId",
  authenticateMiddleware,
  UserController.followUser
);

module.exports = router;
