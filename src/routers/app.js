const express=require("express");
const bodyParser=require("body-parser");
require("../../src/database/mongoose");
const userRouter=require("../../src/routers/users.js");
const taskRouter=require("../../src/routers/tasks.js");
var cookieParser = require('cookie-parser')

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())
app.use(cookieParser());
app.use(userRouter);
app.use(taskRouter);


module.exports=app;