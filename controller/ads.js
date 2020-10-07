const AsyncHandler = require("express-async-handler");
const User = require('../models/user');
const Ads = require('../models/ads');
var slugify = require("slugify");
const CustomError = require("../helpers/error/customError");
const cities = require("../public/static/json/cities.json");
const carbrands = require("../public/static/json/cars.json");



const advertise = AsyncHandler(async function(req,res,next){
    const user_id = req.user.id;
    const {title,brand,series,price,city,model,year,fuel,gear,km,status,description,engine_power,engine_volume,car_traction,color
    ,guarantee,plate_nation,trade,from} = req.body;
    let x = false
    console.log(brand.toLowerCase())

    if(!brand ||!series){
        return next(new CustomError("please type brand and series",400))
    }    
    carbrands.forEach(e =>{
        if(brand.toLowerCase()==e.brand && e.models.indexOf(series.toLowerCase())!==-1){
            x = true;
        }
    });
    if(!x){
        return next(new CustomError("Brand or series is not in the lists",400));
    }
    //brand ve series gönderirken slugify yap...
    const user = await User.findById(user_id);
    const adv = await Ads.create({
        title,
        brand: brand.toLowerCase(),
        series: series.toLowerCase(),
        model: model,year,fuel,price,city,gear,km,status,description,engine_power,engine_volume,car_traction,color
    ,guarantee,plate_nation,trade,from,
        user : user_id
    });
    user.ads.push(adv._id);
    await user.save();
    await adv.save();
    res.status(200).json({
        success: true,
        message: "Advertizing successfull! Wait that experts approve your adv",
        adv: {
            id: adv._id,
            title: adv.title,
            isApproved: adv.isApproved,
            user: adv.user
        },
        user: {
            ads: user.ads
        }

    });


});
const getSpecifiedAdv = AsyncHandler(async function(req,res,next){
    ad_id  = req.params.id;
    const adv = await Ads.findById(ad_id);
    if(!adv){
        return next(new CustomError("No ads with that id",404));
    }
    res.status(200).json({
        success: true,
        advertisement: adv
    });
});
const getSpecifiedBrand = AsyncHandler(async function(req,res,next){
        var matched = false
        let brand = new RegExp(req.params.brand,"i");
        for(var i = 0 ; i<carbrands.length ;i++){
            var exp = new RegExp(carbrands[i].brand,"i");
            if(brand.test(exp)){
                matched=true;
                break;
            }
        }
        if(!matched){
            return next(new CustomError("Not Found",404))
        }
        const query = req.queryFunction;
        const total = req.total;
        const pagination = req.pagination;
        const cars = await query
        res.status(200).json({
            success: true,
            pagination:pagination,
            total:total,
            cars: cars
        }); 
});
const getSpecifiedSeries = AsyncHandler(async function(req,res,next){
    var matched = false
    let brand = new RegExp(req.params.brand,"gi");
    let series = new RegExp(req.params.series,"gi");

    for(var i = 0 ; i<carbrands.length ;i++){
        var exp = new RegExp(carbrands[i].brand,"gi");
        if(brand.test(exp)){
            carbrands[i].series
            for(var j = 0 ; j<carbrands[i].models.length ;j++){
                var expSeries = new RegExp(carbrands[i].models[j],"gi");
                if(series.test(expSeries)){
                    i=carbrands.length;
                    matched=true;
                    break;
                }
            }
            
        }
    }
    if(!matched){
        return next(new CustomError("Not Found",404))
    }
    const query = req.queryFunction;
    const total = req.total;
    const pagination = req.pagination;
    const cars = await query
    res.status(200).json({
        success: true,
        pagination:pagination,
        total:total,
        cars: cars
    }); 
})
const getAllAdvs = AsyncHandler(async function(req,res,next){
    /*  req.queryFunction = query;
        req.total = total;
        req.pagination = pagination; */
     
    const query = req.queryFunction;
    const total = req.total;
    const pagination = req.pagination;
    const cars = await query;
    res.status(200).json({
        success:true,
        total:total,
        pagination:pagination,
        cars : cars
    });
});
const updateAd = AsyncHandler(async function(req,res,next){
    const ad_id = req.params.id;
    const info = req.body
    if(info.hasOwnProperty("user")||info.hasOwnProperty("modifiedBy")||info.hasOwnProperty("isChecked")||info.hasOwnProperty("recommendedPrice")
    ||info.hasOwnProperty("isApproved")){
        return next(new CustomError("You can not change some of properties",400))
    }
    if(Object.entries(info).length===0){
        return next(new CustomError("No information was updated!",400))
    }
    var ad = await Ads.findByIdAndUpdate(ad_id,{
        ...info,
        
    });
    if(info.hasOwnProperty("price")||info.hasOwnProperty("brand")||info.hasOwnProperty("model")||info.hasOwnProperty("series")
        ||info.hasOwnProperty("year")||info.hasOwnProperty("fuel")||info.hasOwnProperty("gear")||info.hasOwnProperty("km")
        ||info.hasOwnProperty("engine_power")||info.hasOwnProperty("engine_volume")||info.hasOwnProperty("car_traction")
        ||info.hasOwnProperty("status")){
            const adsame = await Ads.findById(ad_id);
            adsame.isApproved = false;
            adsame.isChecked = false;
            await adsame.save();
    }
    res.status(200).json({
        success: true,
        message:"Ad updated please wait for approving your ad!!!"
    })
    
});
const imageUpload = AsyncHandler(async function(req,res,next){

    const ad = await Ads.findById(req.params.id);
    console.log(req.files);
    req.files.forEach(e=>{
        ad.images.push(`ad_images_${req.params.id}/${e.filename}`);
    })
    res.status(200).json({
        success:true,
        message:"Image files successfully uploaded",
        images: ad.images
    })  


})


module.exports = {
    advertise,
    getSpecifiedAdv,
    getSpecifiedBrand,
    getSpecifiedSeries,
    getAllAdvs,
    updateAd,
    imageUpload
}