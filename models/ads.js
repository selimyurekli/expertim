const mongoose = require("mongoose");
const User = require("../models/user");
const nodemailer = require("nodemailer");
        
const brands =["toyota", "bmw","mercedes","porsche"];

const adsSchema =  new mongoose.Schema({
    title: {
        type: String,
        required: [true,"Please provide a title for your car"],
        minlength: [10,"at least 10 chars"],
    },
    description: {
        type: String
    },
    price:{
        type : Number,
        required: [true,"price please"]
    },
    brand: {
        type : String,
        required: [true,"Please provide a brand for your car"],
        enums: brands
    },
    series: {
        type : String,
        required: [true,"Please provide a series for your car"]
    },
    model: {
        type : String,
        required: [true,"Please provide a model for your car"]
    },
    year: {
        type : Number,
        required: [true,"Please provide a year for your car"]
    },
    fuel: {
        type : String,
        required: [true,"Please provide a fuel type for your car"],
        enums: ["benzin","benzin & LPG","dizel","elektrik","hybrid"]
    },
    gear: {
        type : String,
        required: [true,"Please provide a gear for your car"],
        enums: ["manuel", "otomatik","yarı otomatik"]
    },
    km: {
        type : Number,
        required: [true,"Please provide a km for your car"]
    },
    engine_power: {
        type : Number

    },
    engine_volume: {
        type : Number
    },
    car_traction: {
        typle : String
    },
    color: {
        type : String
    },
    guarantee: {
        type: Boolean
    },
    plate_nation: {
        type : String
    },
    trade: {
        type : Boolean,
        defauld: false
    },
    status:{   
        type : String,
        required: [true,"Please provide a status for your car"],
        default : "sıfır", 
        enums: ["sıfır", "ikinci el"]
    },
    from: {
        type: String,
        default:"sahibinden",
        enums: ["sahibinden", "galeriden"]
    },
    isDamaged:{
        type: Boolean,
        required: true,
        default: false
    },
    damageAmount:{
        type: Number,
        default:0,
        required: this.isDamaged?true:false
    },
    city:{
        type:String,
        required:true
    },
    images:[
        {
            type: String,
            default: "No-image.jpg"
        }
    ],
   
    isApproved: {
        type: Boolean,
        default:false
    },
    recommendedPrice:{
        type : Number,
        default: null

    },
    isChecked: {
        type : Boolean,
        default: false
    },
    modifiedBy:{
        type: mongoose.Types.ObjectId
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required:true,
        index: true 
    }

},{timestamps:true});

adsSchema.pre("save", async function(next){
    if(!this.isModified("isApproved")){
        next()
    }
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "duckdnsdeneme777@gmail.com", // generated ethereal user
          pass:"159753.gs", // generated ethereal password
        },
    });
    const adUri  =null;
    
    const user =await User.findById(this.user);
    try{ 
        let info = await transporter.sendMail({
        from: transporter.user, // sender address
        to: user.email, // list of receivers
        subject: "Approved- DisApproved-Advertisement", // Subject line
        text: "Your-advertisement", // plain text body
        html: this.isApproved ? `Congratulations! Your advertisement has approved you can view your advertisement <a href="${adUri}">from here</a>`:
        `Expert does not approve your advertisement due to price here is recommended price: ${this.recommendedPrice}`, // html body
        }); 
    }
    catch{
        return next(new CustomError("Email can not be sent",500));
    }
})





module.exports = mongoose.model("ads", adsSchema);



