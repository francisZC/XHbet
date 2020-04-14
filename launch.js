
const http = require("http");
const fs = require('fs');
const url = require('url');
const path = require('path');
// const mqtt = require('mqtt');
// const req = require('./ejs/req');
// const mqttlib = require('./ejs/mqtt');
const querystring = require('querystring');
const curlData = require('./curl')
// const mfs = require("mz/fs");
var resultRet = {
    "progress": 0,
    "status":""
}

const processVal = [0, 20, 30, 40, 50, 60, 70, 80, 90, 100];
function jsReadFiles(files) {
    let output = fs.readFileSync(files, 'utf8');
    return output;
}
var curlJSON = JSON.parse(jsReadFiles("./curl.json"));

const STM32_MAX_BYTES_TO_READ  = 255;
var sio = require('socket.io');
/**
 * const structure which will comes from json and build as base structure
 */


var connect=false;
var start=0;
var dataFromCurl;

// req.prepareconf();


// async function listener(req, res) {
//     let range = req.headers["range"];
//     let p = path.resovle(__dirname, url.parse(url, true).pathname);
//     if (range) {
//         let [, start, end] = range.match(/(\d*)-(\d*)/);
//         try {
//             let statObj = await fs.stat(p);
//         } catch (e) {
//             res.end("Not Found");
//         }
//         let total = statObj.size;
//         start = start ? ParseInt(start) : 0;
//         end = end ? ParseInt(end) : total - 1;
//         res.statusCode = 206;
//         res.setHeader("Accept-Ranges", "bytes");
//         res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
//         fs.createReadStream(p, { start, end }).pipe(res);
//     } else {
//         fs.createReadStream(p).pipe(res);
//     }
// }

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

    switch(command){
        case "Connect":
        case "EraseFullChip":
            
            console.log("Client require :"+pathname);
            let n = 0;
            //add "Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Access-Token"s
            response.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Access-Token"});
            for(data in curlJSON[command]["steps"]){
                let jsonInputData = {
                    "restTag": "suua", 
                    "actionId": 30001, 
                    "parFlag": 1, 
                    "parContent": {
                        "cmd": "start_comm", 
                        "para": {
                            "timeOutCnt": 30,
                        }
                    }
                }
                jsonInputData["parContent"] = curlJSON[command]["steps"][data]['parContent']
                jsonInputData = JSON.stringify(jsonInputData);

                var result = await curlData.processCurls(jsonInputData);
                resHex = JSON.stringify(result["parContent"]["result"]);
                if(resHex >= 0){
                    n++;
                    console.log(n)
                    resultRet["progress"] = processVal[n];
                    resultRet["status"] = "Connecting";
                    if(n >= 9){
                        resultRet["status"] = "Connect OK";
                    }
                    
                }
                else{
                    
                    resultRet["progress"] = processVal[n];
                    resultRet["status"] = "Time out";
                    
                }
                
            }
            response.write(JSON.stringify(resultRet));
            response.end();
            break;
        case "ReadandSave":
            
            request.on('data', async function (chunk) {
                let dataReadSave = {
                    "restTag": "suua", 
                    "actionId": 30001, 
                    "parFlag": 1, 
                    "parContent": {
                        "cmd": "readmem", 
                        "para": {
                            "timeOutCnt": 30,
                        }
                    }
                }
                Data += chunk;
                Data = JSON.parse(Data);
                let fileName = Data.fileName;
                let baseAddress = parseInt(Data.baseAddress);
                let sizeInByte = parseInt(Data.sizeByte, 16);
                /** Recieve data type:
                 * { 
                 *      fileName: 'startjump.bin',
                 *      baseAddress: '0x80000000',
                 *      sizeByte: '192' 
                 *  }
                 */
                let readFlashOffset = 0;
                let nextLenToRead = STM32_MAX_BYTES_TO_READ;
                let address = baseAddress;

                while(readFlashOffset < sizeInByte){
                    let paraField = {'timeOutCnt':30, 'addr':800, 'nbrRead':1};
                    paraField["addr"] = '0x'+ address.toString(16);
                    address = baseAddress + readFlashOffset;
                    paraField["nbrRead"] = 1;
                    dataReadSave["parContent"]["para"] = paraField;
                    // dataReadSave = JSON.stringify(dataReadSave).replace('800',address);

                    console.log('----dataReadSave',dataReadSave)
                    let result = await curlData.processCurls(JSON.stringify(dataReadSave));

                    resHex = JSON.stringify(result["parContent"]["result"]);
                    console.log('----------------save-return----',result,resHex)

                    parContentResult =  result['parContent']['result']
                    parContentHex = result['parContent']['hex']
                    readFlashOffset = readFlashOffset + result.length/2;
                    if (readFlashOffset + STM32_MAX_BYTES_TO_READ > sizeInByte){
                        nextLenToRead = sizeInByte - readFlashOffset
                    }else{
                        nextLenToRead = STM32_MAX_BYTES_TO_READ;
                    }
                }
     
                let data = 'this is first data to file';
                // fs.writeFile(fileName, data, (err)=>{
                //     if(err) throw err;
                //     console.log('文件'+fileName+'已保存')
                // })
            })
            request.on('end',function () {
            });
    
            break;
        case ".json":
            console.log("Client require :"+pathname);
            Data = fs.readFileSync("."+pathname,'utf-8');
            response.writeHead(200, {"Content-Type": "application/json", "Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Access-Token"});            response.write(JSON.stringify(Data));
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
            console.log("Client require index.html:"+pathname);
            Data = fs.readFileSync('./index.html','utf-8');
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(Data);
            response.end();
        
    }

}).listen(8888);

// var socket = sio.listen(http);
//req.req_test();
console.log("server start......");





