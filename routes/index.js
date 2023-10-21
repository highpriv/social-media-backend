const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");

const { controllerRootSlash } = require("../controllers");

router.get("/", controllerRootSlash);
router.use("/auth", authRoutes);

module.exports = router;
