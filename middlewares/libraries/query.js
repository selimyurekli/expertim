const CustomError = require("../../helpers/error/customError");
const AsyncErrorWrapper = require("express-async-handler")
const Ads = require("../../models/ads")
const adsQueryMiddleware=function(options){
    return AsyncErrorWrapper(async function(req,res,next){
        
        //req.session.current_url = 
        let query = Ads.find({isApproved:true}).select("title price km createdAt year brand series isApproved user");
        if(req.params.brand){
            var brand = new RegExp(req.params.brand,"gi");
            query=query.where({brand:brand})
        }
        if(req.params.series){
            var series = new RegExp(req.params.series,"gi");
            query=query.where({series:series})
        }
        query = searchHelper(query,req);
        query = populateHelper(query,req,options);        
        var results= await paginationHelper(query,req);
        query = results.query;
        query = sortHelper(query,req);   
        const pagination = results.pagination;
        const total = results.total
        req.queryFunction = query;
        req.total = total;
        req.pagination = pagination;
        next();
    })



}

//helper functions
const searchHelper = function(query,req){
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
            const regex =new RegExp(cities[`${e}`]);
            query=query.where({city: regex});
        })
        const regex =new RegExp(cities[`${req.query.cityCode[0]}`]);
        query=query.where({city: regex});
    }

    return query;

}

const populateHelper = function(query,options){
        //model filter
        //options
         /* {
            path:"user",
            select: "name profile_image"
        } */
        return query.populate(options.path,options.select);
}
 const paginationHelper = async function(query,req){
    //pagination
    var total = (await query).length
    var limit = parseInt(req.query.limit) || 30;
    var page = parseInt(req.query.page) || 1 ;
    var startIndex = (page-1)*limit;
    var endIndex = page*limit
    var pagination = {}
    if(startIndex >0){
        pagination.previous = {
            page:page-1
        }
    }
    if(endIndex<total){
        pagination.next = {
            page:parseInt(page)+1
        }
    }
    
    return {
        pagination : pagination,
        query : query.skip(startIndex).limit(limit),
        total : total
    }
}
const sortHelper = function(query,req){
    //sorting
    const sortKey = req.query.sortBy;
    if(sortKey ==="price-desc"){
        return query.sort("-price")
    }
    else if(sortKey ==="price-asc"){
        return query.sort("price")
    }
    else if(sortKey ==="year-desc"){
        return query.sort("-year")
    }
    else if(sortKey ==="year-asc"){
        return query.sort("year")
    }
    else if(sortKey==="km-desc"){
        return query.sort("-km")
    }
    else if(sortKey==="km-asc"){
        return query.sort("km")
    }
    else if(sortKey==="date-asc"){
        return query.sort("createdAt")
    }
    
    return query.sort("-createdAt")
    
}
module.exports = {
    adsQueryMiddleware
}