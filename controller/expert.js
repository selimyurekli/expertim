const AsyncHandler = require("express-async-handler");
const User = require('../models/user');
const Ads = require('../models/ads');
const CustomError = require("../helpers/error/customError");


const getDisapprove = AsyncHandler(async function(req,res,next){
    const adv_id = req.params.id;
    const adv  =  await Ads.findById(adv_id);
    
    res.render("getDisapprove",{
        success:true,
        adv:adv
    })
   
})
const getApprove = AsyncHandler(async function(req,res,next){
    const adv_id = req.params.id;
    const adv  =  await Ads.findById(adv_id);
    
    res.render("getApprove",{
        success:true,
        adv:adv
    })   
})
const approve =  AsyncHandler(async function(req,res,next){
    
    const adv_id = req.params.id;
    const adv  =  await Ads.findById(adv_id);
   
    if(!adv){
        
        return next (new CustomError("No advertisement with that id",400))
    }
    adv.isApproved = true;
    adv.modifiedBy = req.user.id;
    adv.isChecked = true;
    //send mail to user when approving modified
    console.log(adv);
    await adv.save();
    
    res.status(200)./* json({
        success:true,
        message: "Successfully approved the ad",
        advertisement: adv
    }) */redirect("/api/expert/advertiseapprove/"+adv.id);
})
const disapprove =  AsyncHandler(async function(req,res,next){
    const adv_id = req.params.id;
    const adv  =  await Ads.findById(adv_id);
    const recommendedPrice = req.body.recommendedPrice;
    

    adv.recommendedPrice = recommendedPrice;
    if(!adv){
        return next (new CustomError("No advertisement with that id",400))
    }
    if(adv.isChecked &&adv.isApproved){
        return next (new CustomError("This advertisement already approved and checked!",400))
    }
    adv.isApproved = false;
    //kullanıcı price ı değiştirdiğinde tekrar kontrol edilmek için false olucak.
    adv.isChecked = true;
    adv.modifiedBy = req.user.id;
    //send mail to user when approving modified
    
    await adv.save();
    
    res.status(200)./* json({
        success:true,
        message: "Unfortunately! disapproved the ad!",
        advertisement: adv
    }); */redirect("/api/expert/uncheckeds");
});
const getUncheckeds =  AsyncHandler(async function(req,res,next){
    const uncheckedAdvs = await Ads.find({
        isChecked: false,
    });
    if(!uncheckedAdvs){
        return next (new CustomError("No unchecked Advs",400));
    }
    
    res.status(200).render("expertUncheckeds.ejs",{
        success:true,
        ads: uncheckedAdvs  
    });
});

module.exports = {
    approve,
    disapprove,
    getUncheckeds,
    getDisapprove,
    getApprove
};
