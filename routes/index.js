const express = require("express");
const router = express.Router();

const { controllerRootSlash, SettingsController } = require("../controllers");

router.get("/", controllerRootSlash);

module.exports = router;
