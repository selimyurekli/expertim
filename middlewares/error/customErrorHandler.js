const CustomError = require("../../helpers/error/customError");
 
const customErrorHandler=function(err,req,res,next){
        console.log(err);
        if(err){
            let custErr  =  err;

            if(custErr.code === 11000){
                custErr = new CustomError("Please Try logging with different email", 400);
            };
            if(custErr.name==="CastError"){
                custErr = new CustomError("CastError", 400);
            };


            res.status(custErr.code ||500)
            .json({
                success: false,
                message: custErr.message,
                statusCode: custErr.code
            });
        }
        else{
            return next();
        }
}

module.exports ={customErrorHandler};



