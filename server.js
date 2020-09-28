const express = require('express')
const app = express();
const dotenv = require("dotenv"); 
const index = require("./routes/index");
const path = require("path");
const {connectDatabase} = require("./helpers/database/connectDatabase");
dotenv.config({path:"./config/env/config.env"});
const {customErrorHandler} = require("./middlewares/error/customErrorHandler");


app.use(express.json());
connectDatabase();
app.use("/api",index);
app.get('/', function (req, res) {
  res.send('Hello World');
})  

app.use(customErrorHandler);
app.use(express.static(path.join(__dirname,"public/static")));

const {PORT }= process.env;
app.listen(PORT,()=>{
    console.log("The application is started on port: ",PORT);
})





