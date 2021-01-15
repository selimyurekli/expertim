const multer = require("multer");
const path = require("path")
const User= require("../../models/user");
const CustomError = require("../error/customError");
var storage = multer.diskStorage({
    
    destination: function (req, file, cb) {
        
      const rootDir = path.dirname(require.main.filename);
      
      cb(null, rootDir+"/public/profile_images")
    },
    filename: async function (req, file, cb) {
      //mimetype is like "image/png"
      const extension = file.mimetype.split("/")[1];
    if(!(req.user.id===undefined)){
        cb(null, "profile_image_"+req.user.id+"."+extension);
    } 
    else{
        cb(new CustomError("Undefined-id",400),false);
    }
    }
});

const fileFilter = (req, file, cb )=>{
    const extension = file.mimetype.split("/")[1];
    if(extension === "jpeg" ||extension === "jpg"||extension === "gif"||extension === "png" ){
        cb(null, true);
    }
    else{
        return cb(new CustomError("Please enter a valid (jpeg,jpg,gif,png) image file",400),false);
    }

}


var profileImageUpload = multer({storage,fileFilter});
module.exports = {profileImageUpload};

