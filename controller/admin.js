const AsyncHandler = require("express-async-handler");
const User = require('../models/user');
const CustomError = require("../helpers/error/customError");
const Ads = require("../models/ads");
const blockUser = AsyncHandler(async function(req,res,next){
    const idThatWillBlock = req.params.id;
    const user = await User.findById(idThatWillBlock);
    if(user.blocked){
        return next(new CustomError("This user has already been blocked",400))
    }
    user.blocked = true;
    await user.save();
    res.status(200).json({
        success: true,
        message: "User called "+user.name+ " is blocked",
        blocked: user.blocked
    }); 
})
const unblockUser = AsyncHandler(async function(req,res,next){
    const idThatWillBlock = req.params.id;
    const user = await User.findById(idThatWillBlock);
    if(!user.blocked){
        return next(new CustomError("User unblocked",400))
    }
    user.blocked = false;
    await user.save();
    res.status(200).json({
        success: true,
        message: "User called "+user.name+ " is unblocked",
        blocked: user.blocked
    }); 

    
});
const deleteUser = AsyncHandler(async function(req,res,next){
    const idThatWillBeDeleted = req.params.id;
    const user = await User.findByIdAndRemove(idThatWillBeDeleted);
    res.status(200).json({
        success:true,
        message: "User is deleted successfully!"
        ,user: {
            id : user._id,
            name: user.name
        }

    });
})
const deleteAd = AsyncHandler(async function(req,res,next){
    const idThatWillBeDeleted = req.params.id;
    const ad = await Ads.findByIdAndRemove(idThatWillBeDeleted);
    res.status(200).json({
        success:true,
        message: "User is deleted successfully!"
        ,user: {
            id : ad._id,
            name: ad.title
        }
    });
})
const expertRegister = AsyncHandler(async function(req,res,next){
    const info = req.body;
    info.role = "expert";
    const expertUser = await User.create({
        ...info
    });
    if(!expertUser){
        return next(new CustomError("Expert can not created!",500))
    }
    res.status(200).json({
        success: true,
        message: "expert register successfull!!"
    });
})




module.exports = {
    blockUser,
    unblockUser,
    deleteUser,
    expertRegister,
    deleteAd
}







