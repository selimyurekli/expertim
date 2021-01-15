const nodemailer = require("nodemailer");
const CustomError  = require("../error/customError");
const sendJWTFromUserForRegister = async function ( user, res, next){
    const {NODE_ENV} = process.env;

    const token  = user.generateJWT();
    if(!token){ 
        return next("Token error!", 500);
    }
    
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL.toString(), // generated ethereal user
          pass: process.env.SMTP_PASSWORD.toString(), // generated ethereal password
        },
    });
    const verifyUrl = `http://localhost:5000/api/auth/verifyaccount/${user._id}?verifytoken=${user.verifyToken}`;
      
      
    try{ 

        let info = await transporter.sendMail({
        from: process.env.SMTP_EMAIL, // sender address
        to: user.email, // list of receivers
        subject: "Verify Your Account ✔", // Subject line
        text: "Verify Link:", // plain text body
        html: `Verify your account from <a href=${verifyUrl}>here</a>`, // html body
        });
        res.status(200)
        .cookie("access_token",token)
        .render("registerSuccessfully",{
            success: true,
            message: "You have successfully logged in or registered! Please verify your account by clicking link in your mail adress",
            user: user,
            token: token
        })
    }
    catch(err){
        console.log(err);
        return next(new CustomError("Verify email can not be sent",500));
    }
}
const sendJWTFromUser = function ( user, res, next){
    const {NODE_ENV} = process.env;

    const token  = user.generateJWT();
    if(!token){ 
        return next("Token error!", 500);
    }
    
    /* res.status(200)
    .cookie("access_token",token)
    .redirect("loginAction",{
        success: true,
        message: "You have successfully logged in!",
        user: user,
        token:token
    }); */

    
    res.status(200)
    .cookie("access_token",token)
    .redirect('/');
    //or'back'





}

module.exports ={
    sendJWTFromUser,
    sendJWTFromUserForRegister
}
