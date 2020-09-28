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
          user: "duckdnsdeneme777@gmail.com", // generated ethereal user
          pass:"159753.gs", // generated ethereal password
        },
    });
    const verifyUrl = `http://localhost:5000/api/auth/verifyaccount/${user._id}?verifytoken=${user.verifyToken}`;
      
      
    try{ 

        let info = await transporter.sendMail({
        from: "duckdnsdeneme777@gmail.com", // sender address
        to: user.email, // list of receivers
        subject: "Verify Your Account ✔", // Subject line
        text: "Verify Link:", // plain text body
        html: `Verify your account from <a href=${verifyUrl}>here</a>`, // html body
        });
        console.log(token);
        res.status(200)
        .cookie("access_token",token)
        .json({
            success: true,
            message: "You have successfully logged in or registered! Please verify your account by clicking link in your mail adress",
            user: user,
            token: token
        })
    }
    catch{
        return next(new CustomError("Verify email can not be sent",500));
    }
}
const sendJWTFromUser = function ( user, res, next){
    const {NODE_ENV} = process.env;

    const token  = user.generateJWT();
    if(!token){ 
        return next("Token error!", 500);
    }
    
    res.status(200)
    .cookie("access_token",token)
    .json({
        success: true,
        message: "You have successfully logged in!",
        user: user,
        token:token
    });
}

module.exports ={
    sendJWTFromUser,
    sendJWTFromUserForRegister
}