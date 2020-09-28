const express = require("express");
const router = express.Router();
const auth = require("./auth");
const users = require("./users");
const admin = require("./admin");
const ads = require("./ads");
const expert = require("./expert");


router.use("/auth", auth);
router.use("/users", users);
router.use("/admin", admin);
router.use("/ads", ads);
router.use("/expert", expert);






module.exports = router;
