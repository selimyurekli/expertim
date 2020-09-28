
const CustomError = require("../helpers/error/customError");
const User = require('../models/user');
const AsyncHandler = require("express-async-handler");



const getUser = AsyncHandler(async(req,res,next)=>{
    const id = req.params.id;
    const user = await userModel.findById(id);
    res.status(200).json({
        success:true, 
        message:"User successfully found",
        data: user
    });
});
module.exports = {
    getUser
}