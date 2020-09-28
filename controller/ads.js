const AsyncHandler = require("express-async-handler");
const User = require('../models/user');
const Ads = require('../models/ads');
var slugify = require("slugify");
const CustomError = require("../helpers/error/customError");
const cities = require("../public/static/json/cities.json");
const carbrands = require("../public/static/json/cars.json");
const { Query } = require("mongoose");

/* let text;
carbrands.forEach(e=>{
    let slugifiedBrand= slugify(e.brand,{
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        remove: /[*+~()'"!:@]?/g, // remove characters that match regex, defaults to `undefined`
        lower: true,      // convert to lower case, defaults to `false`
        strict: false,     // strip special characters except replacement, defaults to `false`
    });
    let slugifiedModels= []
    e.models.forEach(s =>{
         
        slugifiedModels.push( 
            slugify(s,{
                replacement: '-',  // replace spaces with replacement character, defaults to `-`
                remove: /[*+~()'"!:@]?/g, // remove characters that match regex, defaults to `undefined`
                lower: true,      // convert to lower case, defaults to `false`
                strict: false,     // strip special characters except replacement, defaults to `false`
            })
        );
    });
    //console.log(slugifiedBrand+" "+slugifiedModels+"\n")
    var b = "";
    slugifiedModels.forEach((t,i) =>{
        if(i===0)b+=`${t}",`
        else if(i===slugifiedModels.length-1)b+=`"${t}`
        else b+=`"${t}",`
        
    })
    text += `{
    "brand" : "${slugifiedBrand}",
    "models" : ["${b}"]
    },`
    ;
});

console.log(text); */
const advertise = AsyncHandler(async function(req,res,next){
    const user_id = req.user.id;
    const {title,brand,series,model,year,fuel,gear,km,status,description,engine_power,engine_volume,car_traction,color
    ,guarantee,plate_nation,trade,from} = req.body;
    let x = false
    carbrands.forEach(e =>{
        if(brand.toLowerCase()===e.brand && e.models.indexOf(series.toLowerCase())!==-1){
            x = true;
        }
    });
    if(!x){
        return next(new CustomError("Brand or series is not in the lists",400));
    }
    //brand ve series gönderirken slugify yap...
    const adv = await Ads.create({
        title,
        brand: brand.toLowerCase(),
        series: series.toLowerCase(),
        model: model,year,fuel,gear,km,status,description,engine_power,engine_volume,car_traction,color
    ,guarantee,plate_nation,trade,from
    });
    const user = await User.findById(user_id);
    adv.user = user._id;
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
    var brand = (req.params.brand);
    var matched = false;
    if(process.env.NODE_ENV === "production"){
            if(brand.toLowerCase() !== brand){
            console.log("eşit değil")
            carbrands.forEach((e)=>{
                if(brand.toLowerCase() === e.brand){
                    matched= true;
                    res.redirect(`/api/ads/${brand.toLowerCase()}`);
                }
            });
        }
    }
    
    if(!matched){
        carbrands.forEach((e)=>{
            if(brand.toLowerCase() === e.brand){
                matched= true;
            }
        });
        if(!matched){return next(new CustomError("Not Found",404));}
    }
    const cars = await Ads.find({
        isApproved: true,
        brand : brand
    })
    res.status(200).json({
        success: true,
        cars: cars
    });
});




const getSpecifiedSeries = AsyncHandler(async function(req,res,next){
    const brand = (req.params.brand);
    const series = (req.params.series);
    var matched = false;
    if(process.env.NODE_ENV ==="production"){

        if(brand.toLowerCase() !== brand || series.toLowerCase() !==series){
            console.log("eşit değil")
            carbrands.forEach((e)=>{
                if(brand.toLowerCase() === e.brand && e.models.indexOf(series.toLowerCase()) !== -1){
                    matched= true;
                    res.redirect(`/api/ads/${brand.toLowerCase()}/${series.toLowerCase()}`);
                }
            });
        }
    }
    if(!matched){
        carbrands.forEach((e)=>{
            if(brand.toLowerCase() === e.brand && e.models.indexOf(series.toLowerCase()) !==-1){
                matched= true;
            }
        });
        if(!matched){return next(new CustomError("Not Found",404));}
    }

    if(!matched){
        return next(new CustomError("Not Found",404));
    }
    

    const cars = await Ads.find({
        isApproved: true,
        brand :brand,
        series:series
    });
   res.status(200).json({
        success: true,
        cars: cars
    });

})

const getAllAdvs = AsyncHandler(async function(req,res,next){
    //queries
    let query = Ads.find();
    let searchObject={}
    //Search query
    if(req.query.search){
        const regex = new RegExp(req.query.search,"gi")
        query = query.where({title:regex});
    }
    if(req.query.fuel){
        const regex = new RegExp(req.query.fuel,"gi")
        query = query.where({fuel:regex});
    }
    if(req.query.gear){
        const regex = new RegExp(req.query.gear,"gi")
        query = query.where({gear:regex});
    }
    if(req.query.minYear||req.query.maxYear){
        query=query.where({
           $and:[
           {year: { $gte :req.query.minYear?parseInt(req.query.minYear):0 } },
           {year :{ $lte :req.query.maxYear?parseInt(req.query.maxYear):2050}}
            ]
        }
        );
    }
    if(req.query.minKm||req.query.maxKm){
        query=query.where({
           $and:[
           {km: { $gte :req.query.minKm?parseInt(req.query.minKm):0 } },
           {km :{ $lte :req.query.maxKm?parseInt(req.query.maxKm):99999999999999}}
            ]
        }
        );
    }
    if(req.query.maxPrice||req.query.minPrice){
        query=query.where({
           $and:[
           {price: { $gte :req.query.minPrice?parseInt(req.query.minPrice):0 } },
           {price :{ $lte :req.query.maxPrice?parseInt(req.query.maxPrice):99999999999999}}
            ]
        }
        );
    }
    //cities
    if(req.query.cityCode){
        req.query.cityCode.forEach(e=>{
            console.log(cities[`${e}`]);
            const regex =new RegExp(cities[`${e}`]);
            query=query.where({city: regex});
        })
        const regex =new RegExp(cities[`${req.query.cityCode[0]}`]);
        query=query.where({city: regex});
    }
    //model filter
    const populate = true
    const populateObject = {
        path: "user"
    }


    query = query.populate(populateObject);




    


    const cars = await query /* Ads.find({
        //"km":{$range:[req.query.minKm?parseInt(req.query.minKm):0,req.query.maxKm?parseInt(req.query.maxKm):500000000]}
    } ).where();*/
    res.status(200).json({
        success: true,
        cars: cars
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