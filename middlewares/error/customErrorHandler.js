const CustomError = require("../../helpers/error/customError");
 
const customErrorHandler=function(err,req,res,next){
        console.log(err);
        
        if(err){
            let custErr  =  err;

            if(custErr.code === 11000){
                custErr = new CustomError("Please Try logging with different email", 400);
            }
            else if(custErr.name==="CastError"){
                custErr = new CustomError("CastError", 500);
            }
            res.status(custErr.code ||500 )
            .render("errors/error",{
                success: false,
                message: custErr.message || "Error",
                statusCode: custErr.code ||500
            });
        }
        else{
            return next();
        }
}

module.exports ={customErrorHandler};



