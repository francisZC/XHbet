/**
 * Created by Huang Yuanjie on 2019/7/6.
 */

const mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://127.0.0.1',{
    username:'username',
    password:'password',
    clientId:'MQTT_ZH_Medicine_BOOT'
});
var fakeperiod=["System","TUP","Camera","Database","UIP","Motor"];
var progress = 0;
var timeout = 0;
client.on('connect', function () {
    console.log('Mqtt connected.....');
    //client.subscribe('MQTT_ZH_Medicine_TUP');
    sendtriger();
    timeout = setInterval(function(){
        progress = progress + GetRandomNum(2,10);
        if(progress > 100) progress = 100;
        sendstatus(
            fakeperiod[GetRandomNum(0,5)],
            fakelog(),
            progress);
        if(progress == 100){
            sendfinish();
            clearInterval(timeout);
            process.exit();
        }
    },5000);
});
client.on('message', function (topic, message) {
    var msg = JSON.parse(message.toString());
});

function sendtriger(){
    msg = {
        action : "mqtt_booting_trigger"
    }
    client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));
}
function sendfinish(){
    msg = {
        action : "mqtt_booting_finish"
    }
    client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));
}
function sendstatus(period,message,process){
    msg = {
        action : "mqtt_booting_status",
        period: period,
        message: message,
        process: process
    }
    client.publish('MQTT_ZH_Medicine_UI', JSON.stringify(msg));
}
function fakelog(){
        let x = GetRandomNum(5,50);
        let str = "["+x+"]:";
        for(let i=0;i<x;i++){
            str = str + "y ";
        }
        return str;

}
function GetRandomNum(Min,Max)
{
    let Range = Max - Min;
    let Rand = Math.random();
    return(Min + Math.round(Rand * Range));
}
