const http = require("http");
const fs = require('fs');
const url = require('url');
const path = require('path');
const mqtt = require('mqtt');
const req = require('./ejs/req');
const mqttlib = require('./ejs/mqtt');
const querystring = require('querystring');
const fetch = require('node-fetch')
const requestURL = "http://localhost:7999/post"
const requestURL_1 = "http://localhost:8889/post" 
var resultRet = {
    "process": 0,
    "status":""
}
const processVal = [0,10,20,30,50,60,70,80,90,95,100];
var command,reqData
function jsReadFiles(files) {
    let output = fs.readFileSync(files, 'utf8');
    return output;
}
async function jsonParse(res) {
    return await res.json().then(jsonResult => ({ res, jsonResult }));
}

// async function fetchFromBoard(postData){
//     let res;
//     fetch(requestURL,
//     {
//         method:'POST',
//         headers:{
//             'Content-Type':'application/json', 
//             'Connection': 'close'
//         },
//         body: JSON.stringify(postData)
//     })//.then(jsonParse)
//     .then((data)=>{ res=data; console.log(res)})

//     //.then(fetchlist)
//     .catch( (error) => {
//         console.log('request error', error);
//         return { error };
//     });
//     return res;
    
// }


var curlJSON = JSON.parse(jsReadFiles("./curl.json"));

var jsonInputData = {
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




async function processCurls(command, reqData){
    for(data in curlJSON[command]["steps"]){
        let n = 0;
        let resHex;
        
        try{
            
            jsonInputData["parContent"] = curlJSON[command]["steps"][data]['parContent']
            let result = await fetch(requestURL,
                {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json', 
                        'Connection': 'close'
                    },
                    body: JSON.stringify(JSON.stringify(jsonInputData))
                });
            //await fetchFromBoard(JSON.stringify(jsonInputData));
     
            let jsonoutput = await result.json();//await jsonParse(result);
            console.log('------',(JSON.parse(JSON.stringify(jsonoutput["parContent"]))))
            resHex = JSON.stringify(jsonoutput["parContent"]["hex"]);
            console.log("hex is",resHex)
            if(resHex.indexOf("79")!=-1){
                n++;
                resultRet["process"] = processVal[n];
                resultRet["status"] = "Connecting";
                if(n>10){
                    resultRet["status"] = "OK";
                }
                
            }
            else{
                console.log(JSON.parse(JSON.stringify(jsonoutput))["parContent"]["hex"])
                resultRet["process"] = 0
                resultRet["status"] = "Time out";

            }
            return resultRet;
        }catch(e) {
            console.log(e);
            break;
        }
    }
}
exports.processCurls = processCurls