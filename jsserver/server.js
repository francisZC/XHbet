const express = require('express');
const fs = require('fs');
const url = require('url');
const path = require('path');
const mqtt = require('mqtt');
const req = require('./ejs/req');
const mqttlib = require('./ejs/mqtt');
const querystring = require('querystring');
const mfs = require("mz/fs");

var connect=false;
var start=0;
req.prepareconf();

mqttlib.mqttstart();
var app = express();
//指定默认的访问页面（index.html）
app.use(express.static('view'));

//通过路由显示相应的页面
app.use("/request.php", async function (request, response) {
    //res.status(200).sendFile(path.join(__dirname, "view", "index.html"));
    let pathname = url.parse(request.url,false).pathname;
    let filename = pathname.replace(/^.*\/|\..*$/g, "");
    console.log("Client require PHP file :"+filename);
    console.log("Client require :"+pathname);
    let str="";
    request.on("data",function(chunk){
        str+=chunk;
    });
    request.on("end", async function(){
        console.log("post data:"+str);
        //var arg=querystring.parse(str);
        //console.log(arg);
        let ret = await req.database(JSON.parse(str));
        console.log("Server response :"+ret);
        response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
        response.write(ret);
        response.end();
    });
});

app.use("/info", function (request, response) {
    response.sendFile(path.join(__dirname, "view", "info.html"))
});

app.use("*", function (request, response) {
    response.sendFile(path.join(__dirname, "view", "err", "404.html"));
});

app.listen(8888, /*"192.168.56.1",*/ function (err) {
    if (err) {
        console.log("fail to open the port");
        throw err;
    }

    console.log("server start，default IP: 127.0.0.1, Port：%s",'8888');
});
