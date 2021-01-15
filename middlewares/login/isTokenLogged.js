const jwt = require("jsonwebtoken");
const CustomError = require("../../helpers/error/customError");


const isLogged = function(req,res,next){
    var token = req.cookies.access_token
   /*  console.log(token);
    console.log("selam231"); */
    req.isLogged  = false;
    
    jwt.verify(token,process.env.JWT_KEY,(err,decoded)=>{
        if(decoded){
            req.isLogged=true;
            req.logged = decoded;
        }
    })

    next();
    
}


module.exports = {isLogged};



