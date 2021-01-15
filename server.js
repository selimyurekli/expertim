const express = require('express')
const app = express();
const dotenv = require("dotenv"); 
const index = require("./routes/index");
const path = require("path");
var bodyParser = require('body-parser');
const {connectDatabase} = require("./helpers/database/connectDatabase");
dotenv.config({path:"./config/env/config.env"});
const {customErrorHandler} = require("./middlewares/error/customErrorHandler");
var cookieParser = require('cookie-parser')
var {isLogged} = require('./middlewares/login/isTokenLogged');
'use strict';
const session = require('express-session');

app.set("view engine","ejs");
app.set("views",__dirname+"/views");
app.use(express.json());
var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);
app.use(express.static(path.join(__dirname,"/public")));
app.use(cookieParser());
app.use(isLogged);
app.use(session({
  secret:"selimyurekli",
  resave:true,
  saveUninitialized:true,
  previosUrl:"/"
}))

const carbrands = require(path.join(__dirname,"/public/json/cars.json"));


connectDatabase();

app.use("/api",index);
app.get('/', function (req, res) {
  /* req.session.previosUrl = req.originalUrl;
  var user = req.logged
  var object = {
    success:true,
    carbrands:carbrands,
    user:user||undefined,
    isLogged: req.isLogged,
    }; */
  res.redirect("/api/ads/")
  
});









app.use(customErrorHandler);


app.use(function (req,res,next){
	res.status(404).render("errors/error",{
    success:false,
    statusCode: 404,
    message:"Page Not Found"
  })
});

const {PORT }= process.env;
app.listen(PORT,()=>{
    console.log("The application is started on port: ",PORT);
});

