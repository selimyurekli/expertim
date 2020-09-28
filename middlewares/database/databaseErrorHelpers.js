const CustomError = require("../../helpers/error/customError");
const User = require("../../models/user");


const checkUserExists = async function(req,res,next){
    const user_id = req.params.id;
    const user = await User.findById(user_id);
    if(!user){
        return next(new CustomError("No user with that id",400))
    }
    next();


}



module.exports=  {
    checkUserExists
}
