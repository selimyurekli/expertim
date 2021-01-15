const AsyncHandler = require("express-async-handler");
const User = require('../models/user');
const Ads = require('../models/ads');
var slugify = require("slugify");
const CustomError = require("../helpers/error/customError");
const cities = require("../public/json/cities.json");
const carbrands = require("../public/json/cars.json");
const dorms = require("../public/json/il-ilce.json");

const getAdvertise = AsyncHandler(async function (req, res, next) {
    res.render("advertise", {
        isLogged: req.isLogged,
        user: req.logged,
        carbrands: carbrands,
        cities: cities,
        dorms: dorms
    });
})
const getImageUploadToAd = AsyncHandler(async function (req, res, next) {
    res.render("imageuploadToAd",/* {
        id: req.params.id
    } */);
})
const advertise = AsyncHandler(async function (req, res, next) {
    /* console.log(req.body); */
    const user_id = req.user.id;
    const { title, brand, series, price, city, model, year, fuel, gear, km, status, description, engine_power, engine_volume, car_traction, color
        , town, guarantee, plate_nation, trade, from } = req.body;
    let x = false

    if (!brand || !series) {
        return next(new CustomError("Please type brand and series", 400))
    }
    carbrands.forEach(e => {
        if (brand.toLowerCase() == e.brand && e.models.indexOf(series.toLowerCase()) !== -1) {
            x = true;
        }
    });
    if (!x) {
        return next(new CustomError("Brand or series is not in the lists", 400));
    }
    //brand ve series gönderirken slugify yap...
    const user = await User.findById(user_id);
    const adv = await Ads.create({
        title,
        car_traction:car_traction,
        brand: brand.toLowerCase(),
        series: series.toLowerCase(),
        model: model.toLowerCase(), year, fuel, price, city, town, gear, km, status, description, engine_power, engine_volume, color
        , guarantee, plate_nation, trade, from,
        user: user_id
    });
    user.ads.push(adv._id);
    await user.save();
    await adv.save();
    /* res.status(200).json({
        success: true,
        message: "Advertizing successfull! Wait that experts approve your adv",
        carbrands:carbrands,
        cities: cities,
        adv: {
            id: adv._id,
            title: adv.title,
            isApproved: adv.isApproved,
            user: adv.user
        },
        user: {
            ads: user.ads
        }
    }); */
    res.status(200).redirect(`/api/ads/upload/imageupload/${adv._id}`);


});
const getSpecifiedAdv = AsyncHandler(async function (req, res, next) {
    var ad_id = req.params.id;
    var adv = Ads.findById(ad_id).populate("user", "name profile_image phone website instagram facebook twitter city town");
    adv = await adv; 
    if (!adv) {
        return next(new CustomError("No ads with that id", 404));
    }
    console.log(adv);

    res.status(200).render("specific", {
        success: true,
        advertisement: adv,
        carbrands: carbrands,
        cities:cities,
        dorms:dorms,
        isLogged: req.isLogged,
        user: req.logged
    });
});

const getSpecifiedBrand = AsyncHandler(async function (req, res, next) {
    /* req.session.previosUrl = req.originalUrl;
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
    } */
    req.session.previosUrl = req.originalUrl;
    const query = req.queryFunction;
    const total = req.total;
    const pagination = req.pagination;
    const cars = await query;
    const user = req.logged
    console.log(user);
    res.status(200).render("template", {
        success: true,
        total: total,
        user: user,
        isLogged: req.isLogged,
        total: total,
        carbrands: carbrands,
        pagination: pagination,
        cars: cars
    });
});
const getSpecifiedSeries = AsyncHandler(async function (req, res, next) {
    /*     req.session.previosUrl = req.originalUrl;
     */

    /* var matched = false
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
    } */
    req.session.previosUrl = req.originalUrl;
    const query = req.queryFunction;
    const total = req.total;
    const pagination = req.pagination;
    const cars = await query;
    const user = req.logged;
    
    res.status(200).render("template", {
        success: true,
        total: total,
        user: user,
        isLogged: req.isLogged,
        total: total,
        carbrands: carbrands,
        pagination: pagination,
        cars: cars
    });
})
const getAllAdvs = AsyncHandler(async function (req, res, next) {
    /*  req.queryFunction = query;
        req.total = total;
        req.pagination = pagination; */
    req.session.previosUrl = req.originalUrl;
    const query = req.queryFunction;
    const total = req.total;
    const pagination = req.pagination;
    const cars = await query;
    const user = req.logged
    
    res.status(200).render("template", {
        success: true,
        total: total,
        user: user,
        isLogged: req.isLogged,
        total: total,
        carbrands: carbrands,
        pagination: pagination,
        cars: cars
    });
});
const updateAd = AsyncHandler(async function (req, res, next) {
    const ad_id = req.params.id;
    const info = req.body
    if (info.hasOwnProperty("user") || info.hasOwnProperty("modifiedBy") || info.hasOwnProperty("isChecked") || info.hasOwnProperty("recommendedPrice")
        || info.hasOwnProperty("isApproved")) {
        return next(new CustomError("You can not change some of properties", 400))
    }
    if (Object.entries(info).length === 0) {
        return next(new CustomError("No information was updated!", 400))
    }
    var ad = await Ads.findByIdAndUpdate(ad_id, {
        ...info,

    });
    if (info.hasOwnProperty("price") || info.hasOwnProperty("brand") || info.hasOwnProperty("model") || info.hasOwnProperty("series")
        || info.hasOwnProperty("year") || info.hasOwnProperty("fuel") || info.hasOwnProperty("gear") || info.hasOwnProperty("km")
        || info.hasOwnProperty("engine_power") || info.hasOwnProperty("engine_volume") || info.hasOwnProperty("car_traction")
        || info.hasOwnProperty("status")) {
        const adsame = await Ads.findById(ad_id);
        adsame.isApproved = false;
        adsame.isChecked = false;
        await adsame.save();
    }
    res.status(200).json({
        success: true,
        message: "Ad updated please wait for approving your ad!!!"
    })

});
const imageUpload = AsyncHandler(async function (req, res, next) {

    const ad = await Ads.findById(req.params.id);
    
    req.files.forEach(e => {
        ad.images.push(`ad_images_${req.params.id}/${e.filename}`);
    });
    await ad.save();
    /* res.status(200).json({
        success: true,
        message: "Image files successfully uploaded",
        images: ad.images
    }) */
    res.status(200).redirect(`/api/ads/specific/${req.params.id}`);

})
const filter = AsyncHandler(async function (req, res, next) {
    var url = req.session.previosUrl
    url = url ? url.split("?")[0] : "/";
    if (url.indexOf("?") == -1) {
        url = url + "?";
    }
    var k = true
    for (const prop in req.body) {
        if (req.body[`${prop}`] != "") {
            if (k) {
                url = url + `${prop}=${req.body[`${prop}`]}`
                k = false
            } else {
                url = url + `&${prop}=${req.body[`${prop}`]}`
            }
        }
    }

    res.redirect(url);
})

module.exports = {
    advertise,
    getAdvertise,
    getSpecifiedAdv,
    getSpecifiedBrand,
    getSpecifiedSeries,
    getAllAdvs,
    updateAd,
    imageUpload,
    filter,
    getImageUploadToAd
}