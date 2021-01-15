const express = require("express");
const router = express.Router();
const {getRegisterPage,getResetPasswordPage,getLoginPage,getForgotPasswordPage,register,login,forgotPassword,resetPassword,logout, imageUpload, update,getUser,verifyAccount} = require("../controller/auth");
router.use(express.json());
const {profileImageUpload} = require("../helpers/images/imageUpload");
const {getAccessToRoute}  = require("../middlewares/authorization/auth");


router.post("/register",register);//done
router.get("/register",getRegisterPage)//done
router.get("/login",getLoginPage);//done
router.post("/login",login);//done
router.get("/verifyaccount/:id",verifyAccount)//done
router.post("/forgotpassword", forgotPassword);//done
router.get("/forgotpassword", getForgotPasswordPage);//done
router.post("/resetpassword", resetPassword);//done
router.get("/resetpassword", getResetPasswordPage);//done
router.get("/logout",getAccessToRoute, logout);//done
router.get("/profile",getAccessToRoute,getUser);//done    
router.post("/imageupload",[getAccessToRoute,profileImageUpload.single("profile_image")], imageUpload);//done
router.post("/update",getAccessToRoute,update);//done


module.exports = router;


