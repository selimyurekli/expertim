const mongoose = require("mongoose");
const connectDatabase = ()=>{
    const {MONGO_URI} = process.env;
    mongoose.connect(MONGO_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then((res)=> console.log("Successfull database connection"))
    .catch((err)=>console.log(err));

}

module.exports ={
    connectDatabase
} 
