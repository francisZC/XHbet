/**
 * Created by Huang Yuanjie on 2019/7/6.
 */


const mqtt = require('mqtt');

const req = require('./req');
var client  = mqtt.connect('mqtt://127.0.0.1',{
    username:'username',
    password:'password',
    clientId:'MQTT_ZH_Medicine_NODE'
});
var debug_flag ={
    'start':false,
    'done':false,
    'end:':false
};
var command_triger = "";
function mqttstart(){
    client.on('connect', function () {
        console.log('Mqtt connected.....');
        client.subscribe('MQTT_ZH_Medicine_UI');
        fakelog(); //TODO: This function need to remove from the real environment
        realtimepic();
        //trigercommand();
    });
    client.on('message', function (topic, message) {
        var msg = JSON.parse(message.toString());
        mqttdatabase(msg);
    });
}

function realtimepic(){
    setInterval(function(){
        //console.log("what is calimode:"+req.is_calibration());
        if(!req.is_calibration()) return;
        let x = req.GetRandomNum(0,22);
        let msg = {
            action : "ZH_Medicine_Realtime_Picture_Update",
            msg: "./jpg/"+x+".jpg",
            blur: "4."+x
        }
        //console.log("send pic:"+"./jpg/"+x+".jpg");
        client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));
    },200);
}
function fakelog(){
    setInterval(function(){
        let x = req.GetRandomNum(5,50);
        let str = "["+x+"]:";
        for(let i=0;i<x;i++){
            str = str + "y ";
        }
        let msg = {
            action : "ZH_Medicine_Log_Update",
            msg: str
        }
        client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));
    },40000);
}
function trigercommand(){
    setInterval(function(){
        if(command_triger!=""){
            public_debug(command_triger);
            command_triger = "";
        }

    },200);
}
function updatetriger(command){
    command_triger = command;
}
function public_debug(command){
    let debugmsg;
    switch(command) {
        case "mqtt_debug_start":
            debugmsg = {
                action: "mqtt_debug_start",
                msg: "Debug mode on."
            }
            client.publish('MQTT_ZH_Medicine_TUP', JSON.stringify(debugmsg));
            return;
        case "mqtt_debug_done":
            debugmsg = {
                action: "mqtt_debug_done",
                msg: "Debug command done."
            }
            client.publish('MQTT_ZH_Medicine_TUP', JSON.stringify(debugmsg));
            return
        case "mqtt_debug_end":
            debugmsg = {
                action: "mqtt_debug_end",
                msg: "Debug mode off."
            }
            client.publish('MQTT_ZH_Medicine_TUP', JSON.stringify(debugmsg));
            return;
        default:
    }
}
function mqttdatabase(data){
    var key = data.action;
    switch(key) {
        case "mqtt_debug_start_res":
            debug_flag.start = true;
            console.log("mqtt_debug_start_res back");
            return;
        case "mqtt_debug_done_res":
            debug_flag.done = true;
            console.log("mqtt_debug_done_res back");
            return;
        case "mqtt_debug_end_res":
            debug_flag.end = true;
            console.log("mqtt_debug_end_res back");
            return;
        case "mqtt_booting_trigger":
            req.bootreset(true);
            triggerboot(true);
            return;
        case "mqtt_booting_status":
            updateboot(data);
            return;
        case "mqtt_booting_finish":
            req.bootreset(false);
            triggerboot(false);
            return;
        default:
        //do nothing
    }
}
function getdebuginfo() {
    //console.log(JSON.stringify(debug_flag));
    return debug_flag
}
function resetdebuginfo(){
    debug_flag  ={
        'start':false,
        'done':false,
        'end:':false
    };
}
function triggerboot(bool){
    if(bool){
        var msg = {
            action : "ZH_Medicine_Boot_start"
        }
        client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));
    }else{
        var msg = {
            action : "ZH_Medicine_Boot_finish"
        }
        client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));
    }
}
function updateboot(data){
        var msg = {
            action : "ZH_Medicine_Boot_Update",
            period:data.period,
            message:data.message,
            process: data.process
        }
        client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));

}
exports.publicdebug=public_debug;
exports.resetdebuginfo=resetdebuginfo;
exports.getdebuginfo=getdebuginfo;
exports.mqttstart=mqttstart;