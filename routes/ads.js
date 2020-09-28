const express= require("express");
const { getAccessToRoute,getOwnerAccess,checkAdExists} = require("../middlewares/authorization/auth");
const { advertise, getSpecifiedAdv,updateAd,getSpecifiedBrand,getSpecifiedSeries,getAllAdvs,imageUpload}  = require("../controller/ads"); 
const router = express.Router();
const {adImagesUpload} = require("../helpers/images/adImagesUpload")
const fs = require('file-system');
const CustomError = require("../helpers/error/customError");
router.post("/advertise",getAccessToRoute,advertise);
//query kısmına geç
router.get("/",getAllAdvs);
router.get("/:id",getSpecifiedAdv);
router.get("/:brand",getSpecifiedBrand);
router.get("/:brand/:series",getSpecifiedSeries);
router.put("/update/:id",[getAccessToRoute,checkAdExists,getOwnerAccess],updateAd);
router.put("/imageupload/:id",[getAccessToRoute,checkAdExists,getOwnerAccess,(req,res,next)=>{
    var made = fs.mkdir(`public/static/ad_images/ad_images_${req.params.id}`,511);
    if(!made){
        return next(new CustomError("File Error",500));
    }
    next();
},adImagesUpload.array("photos",10)],imageUpload);



module.exports  = router;