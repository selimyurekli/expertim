const AsyncHandler = require("express-async-handler");
const User = require('../models/user');
const nodemailer = require('nodemailer')
const {sendJWTFromUser,sendJWTFromUserForRegister} = require("../helpers/authorization/tokenFunctions");
const CustomError = require("../helpers/error/customError");
const{isSame} = require("../helpers/password/decrypt");
const jwt = require("jsonwebtoken");
const carbrands = require("../public/json/cars.json");

const getRegisterPage =  AsyncHandler(async function(req,res,next){    
    res.render("register",{
        isLogged:req.isLogged,
    });
});
 
const getLoginPage =  AsyncHandler(async function(req,res,next){    
    res.render("login",{
        isLogged:req.isLogged,
    });
});
const getForgotPasswordPage =  AsyncHandler(async function(req,res,next){  
      
    res.render("forgotpassword",{
        isLogged:req.isLogged,
    });
});
const getResetPasswordPage =  AsyncHandler(async function(req,res,next){    
    res.render("resetpassword",{
        isLogged:req.isLogged,
        user:req.logged,
        postUrl:req._parsedOriginalUrl.path
    });
});
const register = AsyncHandler(async function(req,res,next){
   
    const {name, email, password } = req.body;
    const user = await User.create({
        name,
        email,
        password
    }); 
    
    await sendJWTFromUserForRegister(user,res,next);
});
const getUser = AsyncHandler(async function(req,res,next){
    const user = await User.findById(req.user.id).populate("ads","year brand series price isAproved isChecked");
    
    res.status(200).
    render("profile",{
        success:true,
        user:user,
        isLogged:req.isLogged,
        carbrands:carbrands
    });
});
const login = AsyncHandler(async function(req,res,next){
    const {email, password} = req.body;
    var err;
    
    if(!email|| !password){
        

        err =new CustomError("Put the inputs in their place",400) 
        /* return next(new CustomError("Put the inputs in their place",400)); */
    }
    const user = await User.findOne({email: email}).select("+password");
    if(!user){
        err =new CustomError("No user with that email",400)
        /* return next(new CustomError("No user with that email",400)); */
    }
    const match = await isSame(password,user.password);
    if(!(match)){
        console.log("match")
        err = new CustomError("Wrong Password",400)
        /* return next(new CustomError("Wrong Password",400)); */
    }
    if(user.blocked){
        console.log("blocked")

        err = new CustomError("Your account is blocked!!! You can not log in",400)
       /*  return next(new CustomError("Your account is blocked!!! You can not log in",400)); */
    }
    if(!user.isVerified){
        console.log("isVerified")
        err = new CustomError("Please verify your account otherwise you can not contunie!",400)
        /* return next(new CustomError("Please verify your account otherwise you can not contunie!",400)); */
    }
    if(err){
        
        res.status(err.code ||500 )
            .render("loginAction",{
                success: false,
                message: err.message || "Error",
                statusCode: err.code ||500
            });
    }
    else{
        sendJWTFromUser(user,res) ;
    }
    
});
const forgotPassword =AsyncHandler(async function(req,res,next){
    const {email} = req.body;
    const user  = await User.findOne({email:email});
    hashedToken = user.generateResetPasswordToken();

    await user.save();  
    
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "duckdnsdeneme777@gmail.com", // generated ethereal user
          pass:"159753.gs", // generated ethereal password
        },
    });
    const resetPasswordUrl = `http://localhost:5000/api/auth/resetpassword?resetPasswordToken=${hashedToken}`;
  
      
    try{ 
        let info = await transporter.sendMail({
        from:"duckdnsdeneme777@gmail.com", // sender address
        to: email, // list of receivers
        subject: "Reset Password ✔", // Subject line
        text: "Reset password:", // plain text body
        html: `Reset your password from <a href=${resetPasswordUrl}>here</a>`, // html body
        }); 
        res.status(200).
        render("forgotpasswordAction",{
          success: true,
          isLogged:req.isLogged,
          user:req.logged,
          message: "Mail sent to "+email
        });
    }
      catch{
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpire= undefined;
        await user.save();
        return next(new CustomError("Email can not be sent",500));

      }
    

    
}); 
const resetPassword = AsyncHandler(async function(req,res,next){
    const resetPw = req.query.resetPasswordToken;
    const newPass = req.body.newPassword;
    if(!newPass){
        return next(new CustomError("Please enter new password",400));
    }
    const nowdate = Date.now();
    const user = await User.findOne({
        resetPasswordToken: resetPw,
        resetPasswordTokenExpire:{
            $gt:nowdate
        }  
    });
    if(!user){
        return next(new CustomError("Url expired or wrong url for resetting password",400));
    }
    user.password = newPass;
    user.resetPasswordTokenExpire=undefined;
    user.resetPasswordToken= undefined;
    await user.save();

    res.status(200).render("resetpasswordAction",{
        success:true,
        message:"Parolanız başarılı bir şekilde değiştirildi. Lütfen giriş yapınız, sizi giriş sayfasına yönlendiriyoruz... "
    });

});
const logout = AsyncHandler(async function(req,res,next){
    const {JWT_COOKIE_EXPIRE_TIME,NODE_ENV} = process.env;
    /* let a;
    console.log(req.rawHeaders);
    for(var i = 0; i<req.rawHeaders.length; i++){
        if(req.rawHeaders[i].includes("access_token")){
            a = req.rawHeaders[i].split("=")[1]; 
            break;
        }
    }
    if(!a){
        return next(new CustomError("You have already logged out or not logged in yet",400));
    } */
    return res
    .status(200)
    .clearCookie("access_token")
    .render("logout",{
        success: true,
        message:"Logout successfull" 
    });


});
const imageUpload = AsyncHandler(async function(req,res,next){
    const user = await User.findById(req.user.id);
    user.profile_image =req.file.filename;
    await user.save();
    res.status(200).redirect("/api/auth/profile");



})
const update = AsyncHandler(async function(req,res,next){
    const info = req.body;
    
    if(({}).hasOwnProperty.call(info, 'email')||({}).hasOwnProperty.call(info, 'role')||({}).hasOwnProperty.call(info, 'ads')||({}).hasOwnProperty.call(info, 'geolocation')
    ||({}).hasOwnProperty.call(info, 'profile_image')||({}).hasOwnProperty.call(info, 'blocked')||({}).hasOwnProperty.call(info, 'resetPasswordToken')||({}).hasOwnProperty.call(info, 'resetPasswordTokenExpire')
    ||({}).hasOwnProperty.call(info, 'isVerified')||({}).hasOwnProperty.call(info, 'verifyToken')){
        return next(new CustomError("You can only update name, place, website and phone",400))
    }
    if(Object.entries(info).length===0){
        return next(new CustomError("No information was updated!",400))
    }
    var user = await User.findByIdAndUpdate(req.user.id,{
        ...info
    });
    user = await User.findById(req.user.id);
    res.status(200).redirect("profile");




})
const verifyAccount = AsyncHandler(async function(req,res,next){
    var user_id = req.params.id;
    var user;
    if (user_id.match(/^[0-9a-fA-F]{24}$/)) {
        user = await User.findById(user_id);
    }
    if(!user){
        return next(new CustomError("No user with that id",400))
    }
    verifyToken = req.params.verifyToken;
    if(verifyToken === user.verifytoken){
        /* if(user.isVerified){
            return next(new CustomError("You have already verified your account",400))
        } */
        user.isVerified = true;
        await user.save();
        res.status(200).render("verifiedaccountAction",{
            success:true,
            message: "You successfully verified your account!"
        });
    }
    else{
        return next(new CustomError("Wrong Verify Token",400))
    }
})

module.exports = {
    getRegisterPage,
    getForgotPasswordPage,
    getLoginPage,
    register,
    login,
    forgotPassword,
    resetPassword,
    logout,
    imageUpload,
    update,
    getUser,
    verifyAccount,
    getResetPasswordPage
}