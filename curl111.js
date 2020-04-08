const http = require("http");
const fs = require('fs');
const url = require('url');
const path = require('path');
// const mqtt = require('mqtt');
// const req = require('./ejs/req');
// const mqttlib = require('./ejs/mqtt');
const querystring = require('querystring');
const fetch = require('node-fetch')
const requestURL = "http://localhost:7999/post"
const requestURL_1 = "http://localhost:8889/post" 


function jsReadFiles(files) {
    let output = fs.readFileSync(files, 'utf8');
    return output;
}
async function jsonParse(res) {
    return await res.json().then(jsonResult => ({ res, jsonResult }));
}

async function fetchFromBoard(postData){
    let res;
    fetch(requestURL,
    {
        method:'POST',
        headers:{
            'Content-Type':'application/json', 
            'Connection': 'close'
        },
        body: JSON.stringify(postData)
    })//.then(jsonParse)
    .then((data)=>{ res=data; console.log(res)})

    //.then(fetchlist)
    .catch( (error) => {
        console.log('request error', error);
        return { error };
    });
    return res;
    
}


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




async function processCurls( ){
    let n =0;
    for(data in curlJSON['Connect']["steps"]){
        console.log(data)
        try{
            jsonInputData["parContent"] = curlJSON['Connect']["steps"][data]['parContent']
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
            console.log(result);
            let jsonoutput = await result.json();//await jsonParse(result);
            console.log(JSON.parse(JSON.stringify(jsonoutput))["parContent"])
            n++;
            console.log(n,"times")
            if(JSON.parse(JSON.stringify(jsonoutput))["parContent"]["result"]<0){
                
            }
            else{
                
            }
            
        }catch(e) {
            console.log(e);
            break;
        }
    }
}
processCurls()






