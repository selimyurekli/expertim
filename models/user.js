const mongoose = require("mongoose");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken");
const CustomError = require("../helpers/error/customError");
var crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{ 
        type: String,
        required: [true,"please provide a name"]
    },
    email:{
        type: String,
        required: [true,"Please provide an email address"],
        unique: [true,"Try Different email"],
        match : [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,"Email is not in the proper format"],
    },
    password:{
        type: String,
        required: [true,"Please provide a password"],
        minlength: [6,"at least 6 chars"],
        select: false
    },
    role: {
        type: String,
        default: "user",
        enums: ["user","expert","admin"] 
    },
    ads: [{
        type: mongoose.Types.ObjectId,
        ref: "ads"
    }],
    city: {
        type : String
    },
    town: {
        type : String
    },
    instagram: {
        type : String
    },
    facebook: {
        type : String
    },
    twitter: {
        type : String
    },
    geolocation: {
        type:Number
    },
    numberOfAds: {
        type: Number
    },
    phone:{
        type: Number,
    },
    website: {
        type: String
    },
    profile_image: {
        type:String,
        default: "default.jpg"
    },
    blocked: {
        type: Boolean,
        default :false
    },
    resetPasswordToken : {
        type: String
    },
    resetPasswordTokenExpire: {
        type : Number
    },
    verifyToken:{
        type: String
    },
    isVerified: {
        type : Boolean,
        default: false
    }

},{timestamps:true});

userSchema.methods.generateJWT = function(){
    const payload = {
        _id : this._id,
        name: this.name,
        email : this.email,
        profile_image:this.profile_image,
        city:this.city,
        isVerified: this.isVerified,
        role:this.role
    };
    const token = jwt.sign(payload,process.env.JWT_KEY,{
        algorithm: "HS256",
        expiresIn: parseInt(process.env.JWT_EXPIRES)*60,
    });
    return token;
}
userSchema.methods.generateVerifyToken = function(){
   
    const randomHexString = crypto.randomBytes(15).toString("hex");
    const hashedVerifiedToken = crypto.createHash("SHA256").update(randomHexString).digest("hex");
    this.verifyToken = hashedVerifiedToken;
    return this.verifyToken;   
}
userSchema.methods.generateResetPasswordToken = function(){
   
    const resetExpire = parseInt(process.env.RESET_EXPIRE)*60*1000;
    const randomHexString = crypto.randomBytes(15).toString("hex");
    const hashedPasswordToken = crypto.createHash("SHA256").update(randomHexString).digest("hex");
    this.resetPasswordToken = hashedPasswordToken;
    this.resetPasswordTokenExpire = Date.now()+resetExpire;
    return this.resetPasswordToken;   


}
userSchema.pre("save", function(next){

    if(!this.isModified("password")){
        return next()
    }
    bcrypt.genSalt(10, (err, salt)=> {
        if(err) next(new CustomError("Salting Error",500));
        bcrypt.hash(this.password,salt, (err, hash)=> {
            if(err) next(new CustomError("Hashing Error",500))
            this.password= hash;
            next();
        });
    });


});

userSchema.post("save", function(doc,next){
    if(doc){ 
        verifyToken = doc.generateVerifyToken();
    }else{
        return next(new CustomError("Error",500));
    }
    next();
})

module.exports = mongoose.model("users", userSchema);


