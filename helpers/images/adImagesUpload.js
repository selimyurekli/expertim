const multer = require("multer");
const path = require("path")
const User= require("../../models/user");
const CustomError = require("../error/customError");
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const rootDir = path.dirname(require.main.filename);
      var pathAd= path.join(rootDir,`public/ad_images/ad_images_${req.params.id}`)
      cb(null,pathAd);
    },
    filename: (req, file, callback) => {
      const extension = file.mimetype.split("/")[1];
      console.log(req.files.length);
      //console.log(req);
      var filename = `ad_image_${req.files.length}.${extension}`
      callback(null, filename);
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






var adImagesUpload = multer({storage,fileFilter});

module.exports = {adImagesUpload};