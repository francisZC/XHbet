
const http = require("http");
const fs = require('fs');
const url = require('url');
const path = require('path');
const mqtt = require('mqtt');
const req = require('./ejs/req');
const mqttlib = require('./ejs/mqtt');
const querystring = require('querystring');
const curlData = require('./curl')
// const mfs = require("mz/fs");


var sio = require('socket.io');
/**
 * const structure which will comes from json and build as base structure
 */


var connect=false;
var start=0;
var dataFromCurl;

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
    console.log('pathname ', pathname.match(/(\.[^.]+|)$/))
    var command = pathname.match(/(\.[^.]+|)$/)[0];
    if(!command){
        command = pathname.match(/(\.[^.]+|)$/)['input'].replace('/','')
    }
    console.log('command is ', command)
    var Data="";
    var reqData="";
        request.on("data",function(chunk){
            reqData+=chunk;
        });
    switch(command){
        case "Connect":
            result = curlData.processCurls(command,reqData);
            console.log("Client require :"+pathname);
            // Data = fs.readFileSync("."+pathname,'utf-8');
            // data = JSON.stringify(JSON.parse(Data));
            result.then((data)=>{console.log(data)
                response.writeHead(200, {"Content-Type":  'text/html;charset=utf-8'});
                console.log(typeof(JSON.stringify(data)))
                console.log('write data',JSON.stringify(data))
                data = '{"process":0,"status":"OK out"}'
                const buf = Buffer.from(data)
                console.log('buf', buf)
                response.write(buf);
                response.end();
                
            })
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
        case ".woff":
            console.log("Client require :"+pathname);
            //Data = fs.readFileSync("."+pathname,'binary');
            response.writeHead(200, {"Content-Type": "application/x-font-woff"});
            //response.write(Data);
            //response.end();
            var file = "."+pathname;
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                response.contentType = 'application/font-woff';
                response.contentLength = stat.size;
                response.end(img, 'binary');
            });
            break;
        case ".woff2":
            console.log("Client require :"+pathname);
            //Data = fs.readFileSync("."+pathname,'binary');
            response.writeHead(200, {"Content-Type": "font/woff2"});
            //response.write(Data);
            //response.end();
            var file = "."+pathname;
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                response.contentType = 'font/woff2';
                response.contentLength = stat.size;
                response.end(img, 'binary');
            });
            break;
        case ".ttf":
            console.log("Client require :"+pathname);
            //Data = fs.readFileSync("."+pathname,'binary');
            response.writeHead(200, {"Content-Type": "video/mpeg4"});
            //response.write(Data);
            //response.end();
            var file = "."+pathname;
            fs.stat(file, function (err, stat) {
                var img = fs.readFileSync(file);
                response.contentType = 'video/mpeg4';
                response.contentLength = stat.size;
                response.end(img, 'binary');
            });
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

// var socket = sio.listen(http);
//req.req_test();
console.log("server start......");





