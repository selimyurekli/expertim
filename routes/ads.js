const express= require("express");
const { getAccessToRoute,getOwnerAccess,checkAdExists} = require("../middlewares/authorization/auth");
const { getImageUploadToAd,getAdvertise,filter,advertise, getSpecifiedAdv,updateAd,getSpecifiedBrand,getSpecifiedSeries,getAllAdvs,imageUpload}  = require("../controller/ads"); 
const router = express.Router();
const {adImagesUpload} = require("../helpers/images/adImagesUpload")
const fs = require('file-system');
const CustomError = require("../helpers/error/customError");
const {adsQueryMiddleware} = require("../middlewares/libraries/query");

router.get("/advertise",getAccessToRoute,getAdvertise);
router.post("/advertise",getAccessToRoute,advertise);
//query kısmına geç
router.get("/",adsQueryMiddleware({//done
    path:"user",
    select: "name"
}), getAllAdvs);
router.get("/specific/:id",getSpecifiedAdv);
router.get("/:brand",adsQueryMiddleware({//done
    path:"user",
    select: "name"
}),getSpecifiedBrand);
router.get("/:brand/:series",adsQueryMiddleware({//done
    path:"user",
    select: "name"
}),getSpecifiedSeries);
router.put("/update/:id",[getAccessToRoute,checkAdExists,getOwnerAccess],updateAd);
router.get("/upload/imageupload/:id",getImageUploadToAd);
router.post("/upload/imageupload/:id",[getAccessToRoute,checkAdExists,getOwnerAccess,(req,res,next)=>{
    fs.mkdir(`public/ad_images/ad_images_${req.params.id}`,511,function(err){
        if(err){
            return next(new CustomError("File Error",500));
        }
        next();
    });
    
},adImagesUpload.array("photos",10)],imageUpload);
router.post("/filter",filter);//done


module.exports  = router;