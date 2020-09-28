const jwt = require("jsonwebtoken");
const CustomError = require("../../helpers/error/customError");


const isLoggedIn = function(req,res,next){
    let a ;
    let authorizationToken;
    console.log(req.rawHeaders);
    for(var i = 0; i<req.rawHeaders.length; i++){
        if(req.rawHeaders[i].includes("access_token")){
            authorizationToken = req.rawHeaders[i].split("=")[1]; 
            break;
        }
    }
    if(authorizationToken){
        const decodedJWT = jwt.decode(authorizationToken);

        if(Date.now()/1000<decodedJWT.exp) next( new CustomError("You are already logged in", 400))
        next();
    }
    next();
   
    

}


module.exports = {isLoggedIn};



