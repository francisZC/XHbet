
const http = require("http");
const fs = require('fs');
const url = require('url');
const path = require('path');
const mqtt = require('mqtt');
const req = require('./ejs/req');
const mqttlib = require('./ejs/mqtt');
const querystring = require('querystring');
// const mfs = require("mz/fs");


var sio = require('socket.io');
/**
 * const structure which will comes from json and build as base structure
 */


var connect=false;
var start=0;


// req.prepareconf();


async function listener(req, res) {
    let range = req.headers["range"];
    let p = path.resovle(__dirname, url.parse(url, true).pathname);
    if (range) {
        let [, start, end] = range.match(/(\d*)-(\d*)/);
        try {
            let statObj = await fs.stat(p);
        } catch (e) {
            res.end("Not Found");
        }
        let total = statObj.size;
        start = start ? ParseInt(start) : 0;
        end = end ? ParseInt(end) : total - 1;
        res.statusCode = 206;
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
        fs.createReadStream(p, { start, end }).pipe(res);
    } else {
        fs.createReadStream(p).pipe(res);
    }
}

http.createServer(async function(request, response) {
    console.log('request url is: ',request.url);
    var pathname = url.parse(request.url,false).pathname;
    var ext = pathname.match(/(\.[^.]+|)$/)[0];
    var Data="";

    switch(ext){
        case ".json":
            console.log("Client require :"+pathname);
            Data = fs.readFileSync("."+pathname,'utf-8');
            console.log(Data)
            data = JSON.stringify(JSON.parse(Data));
            console.log(data)
            response.writeHead(200, {"Content-Type":  'text/html;charset=utf-8'});
            response.write(data);
            response.end();
            break;
        case ".css":
            console.log("Client require :"+pathname);
            Data = fs.readFileSync("."+pathname,'utf-8');
            response.writeHead(200, {"Content-Type": "text/css"});
            response.write(Data);
            response.end("hello world");
            break;
        case ".js":
            console.log("Client require :"+pathname);
            Data = fs.readFileSync("."+pathname,'utf-8');
            response.writeHead(200, {"Content-Type": "application/javascript"});
            response.write(Data);
            response.end();
            break;
        
        case ".png":
            console.log("Client require :"+pathname);
            //Data = fs.readFileSync("."+pathname,'binary');
            response.writeHead(200, {"Content-Type": "image/png"});

            //fs.createReadStream("."+pathname, 'utf-8').pipe(response);
            //response.write(Data);
            //response.end();
            var file = "."+pathname;
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                response.contentType = 'image/png';
                response.contentLength = stat.size;
                response.end(img, 'binary');
            });
            break;
        case ".jpg":
            console.log("Client require :"+pathname);
            //Data = fs.readFileSync("."+pathname,'binary');
            response.writeHead(200, {"Content-Type": "image/jpg"});

            //fs.createReadStream("."+pathname, 'utf-8').pipe(response);
            //response.write(Data);
            //response.end();
            var file = "."+pathname;
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                response.contentType = 'image/jpg';
                response.contentLength = stat.size;
                response.end(img, 'binary');
            });
            break;
        case ".gif":
            console.log("Client require :"+pathname);
            //Data = fs.readFileSync("."+pathname,'binary');
            response.writeHead(200, {"Content-Type": "image/gif"});

            //fs.createReadStream("."+pathname, 'utf-8').pipe(response);
            //response.write(Data);
            //response.end();
            var file = "."+pathname;
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                response.contentType = 'image/gif';
                response.contentLength = stat.size;
                response.end(img, 'binary');
            });
            break;
        
        case ".html":
            console.log("Client require :"+pathname);
            Data = fs.readFileSync("."+pathname,'utf-8');
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(Data);
            response.end();
            break;
        
        case ".php":
            //2 different PHP file:dump.php&request.php
            var filename = pathname.replace(/^.*\/|\..*$/g, "");
            console.log("Client require PHP file :"+filename);
            if(filename == "request"){
                console.log("Client require :"+pathname);
                var str="";
                request.on("data",function(chunk){
                    str+=chunk;
                });
                request.on("end", async function(){
                    console.log("post data:"+str);
                    //var arg=querystring.parse(str);
                    //console.log(arg);
                    var ret = await req.database(JSON.parse(str));
                    console.log("Server response :"+ret);
                    response.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
                    response.write(ret);
                    response.end();
                });
                /*
                request.on("end",function(chunk){
                    str+=chunk;
                });*/

            }else if(filename = "upload"){
                var para_name = "id";
                var reg = new RegExp("(^|&)" + para_name + "=([^&]*)(&|$)", "i");
                var id = request.url.substring(request.url.indexOf("=")+1);

                console.log("User want to upload file: usr id="+id);
                var chunks = [];
                var size = 0;
                request.on('data' , function(chunk){
                    chunks.push(chunk);
                    size+=chunk.length;
                });

                request.on("end",function(){
                    var buffer = Buffer.concat(chunks , size);
                    if(!size){
                        response.writeHead(404);
                        response.end('');
                        return;
                    }

                    var rems = [];

                    var files_head=[];
                    for(var i=0;i<buffer.length-1;i++){
                        var v = buffer[i];
                        var v2 = buffer[i+1];
                        if(v==13 && v2==10){
                            rems.push(i);
                        }
                    }
                    // first we need to get first line as seed
                    var first_line = buffer.slice(0,rems[0]).toString();

                    files_head.push(0);//First file's start is at 0
                    for(var i=0;i<rems.length;i++){
                        if(rems[i+1]-rems[i]-2 == first_line.length){
                            if(first_line == buffer.slice(rems[i]+2,rems[i+1]).toString()){
                                files_head.push(rems[i]+2);
                                console.log("Push "+rems[i]+" into file_head");
                            }
                        }
                    }// we get every file head here
                    console.log('Upload ['+(files_head.length-1)+"] files.");
                    for(var i=0;i<files_head.length-1;i++){
                        var nbuf;
                        var web_head;
                        var filename;
                        var j=0
                        for(;j<rems.length;j++){
                            if(rems[j]>files_head[i]) break;
                        }
                        if(i<files_head.length-1){
                            nbuf = buffer.slice(rems[j+3]+2,files_head[i+1]-2);
                        }else{
                            nbuf = buffer.slice(rems[j+3]+2,rems[rems.length-2]);
                        }
                        web_head = buffer.slice(rems[j]+2,rems[j+1]).toString();

                        filename = web_head.match(/filename=".*"/g)[0].split('"')[1];
                        console.log("Save file:"+filename);
                        var path = Save_path+"/"+filename;
                        fs.writeFileSync(path , nbuf);
                    }

                    response.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8'});
                    response.end(JSON.stringify('Upload ['+(files_head.length-1)+'] successfully!'));

                    //response.writeHead(200, { 'Content-Type': 'text/plain;charset=utf-8'});
                    //response.end('Upload ['+files_head.length+"] files successfully!");
                });

                var file_obj = request.form;
                console.log(file_obj);

            }
            break;
        default:
            if(req.if_boot()){

                console.log("Client require :"+pathname);
                Data = fs.readFileSync('./booting.html','utf-8');
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(Data);
                response.end();
            }else{

                console.log("Client require index.html:"+pathname);
                Data = fs.readFileSync('./index.html','utf-8');
                response.writeHead(200, {"Content-Type": "text/html"});
                response.write(Data);
                response.end();
            }
    }

}).listen(8888);

var socket = sio.listen(http);
//req.req_test();
console.log("server start......");

mqttlib.mqttstart();





