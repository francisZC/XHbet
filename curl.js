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

const processVal = [0,10,20,30,50,60,70,80,90,95,100];
var command,reqData

async function jsonParse(res) {
    return await res.json().then(jsonResult => ({ res, jsonResult }));
}

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

 async function processCurls(reqData){
    //  let data1 = JSON.stringify(reqData)
     console.log('-------req data',reqData)
        try{
            let result = await fetch(requestURL,
                {
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json', 
                        'Connection': 'close'
                    },
                    body: reqData
                });   
                let jsonoutput = await result.json()
                return jsonoutput;   
        }catch(e) {
            console.log(e);
        }
        
   
}
exports.processCurls = processCurls