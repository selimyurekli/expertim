const express = require("express");
const router = express.Router();
const {register,login,forgotPassword,resetPassword,logout, imageUpload, update,getUser,verifyAccount} = require("../controller/auth");
const {isLoggedIn} = require("../middlewares/login/isTokenLogged");
router.use(express.json());
const {profileImageUpload} = require("../helpers/images/imageUpload");
const {getAccessToRoute}  = require("../middlewares/authorization/auth");


router.post("/register",register);
router.post("/login",login);
router.get("/profile",getAccessToRoute,getUser);
router.get("/verifyaccount/:id",verifyAccount)
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword", resetPassword);
router.get("/logout",getAccessToRoute, logout);
router.put("/imageupload",[getAccessToRoute,profileImageUpload.single("profile_image")], imageUpload);
router.put("/update",getAccessToRoute,update);


module.exports = router;


