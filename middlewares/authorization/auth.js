const { JsonWebTokenError } = require("jsonwebtoken");

const jwt  = require("jsonwebtoken");
const CustomError = require("../../helpers/error/customError");
const User = require("../../models/user");
const Ads= require("../../models/ads")

const getAccessToRoute = function(req,res,next){

    if(!(req.headers.authorization && req.headers.authorization.startsWith("bearer"))){
        return next(new CustomError("You are not authorized to access this route",401));
    }
    const token = req.headers.authorization.split(" ")[1];
    const {JWT_KEY} = process.env;
    jwt.verify(token,JWT_KEY,(err,decoded)=>{
        if(err){
            return next(new CustomError("You are not authorized to access this route",401));
        }
        if(!(decoded.isVerified)){
            return next(new CustomError("Please complete your verification step to contunie",401));
        }
        req.user = {
            id : decoded._id,
            name: decoded.name
        }
        next();
    })

}
const getAdminAccess = async function(req,res,next){
    const user_id  = req.user.id;

    const user = await User.findById(user_id);
    if(!(user.role ==="admin")){
        return next(new CustomError("You are not authorized to access admin panel",400));
    }
    next();
};

const getExpertAccess = async function(req,res,next){
    const user_id  = req.user.id;
    const user = await User.findById(user_id);
    if((user.role === "user")){
        return next(new CustomError("You are not authorized to access panel",400));
    }
    next();

}
const getOwnerAccess = async function(req,res,next){
    const user_id  = req.user.id;
    const ad_id = req.params.id;
    const ad = await Ads.findById(ad_id); 
    if((ad.user != user_id)){
        return next(new CustomError("Only question owner can access this route",400));
    }
    next();

}
const checkAdExists =async function(req,res,next){
    const ad_id = req.params.id;
    const ad = await Ads.findById(ad_id); 
    if((!ad)){
        return next(new CustomError("No ad found with that id",400));
    }
    next();
};

module.exports={
    getAccessToRoute,
    getAdminAccess,
    getExpertAccess,
    getOwnerAccess,
    checkAdExists
}