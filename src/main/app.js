/**
 * Created by zc on 2020/3/17.
 */

//require('babel-polyfill');
import React,  {
    Component,
    PropTypes
    }from "react";
import ReactDOM from "react-dom";
// import classNames from 'classnames';
import Foot from "../foot/foot"
import Head from "../head/head"

import Basicview from "../container/basicview/Basicview"

import './App.css';
// import fetch from 'isomorphic-fetch';
// import { b64_sha1,jsondeepCopy } from '../util/util.js';
// require('es6-promise').polyfill();


var winWidth;
var winHeight;
var mqttconf={};

var timeouthandle = null;
var temprun = false;
class App extends Component{
    constructor(props) {
        super(props);
        this.state = {
            width: 1024,
            height: "100%",
            headfootheight: 50,
            headfootminheight: 50,
            canvasheight: 700,
            margintop:20,

            language:{
                "apptitle":"Xiaohui Bootloader Excel Tools V0.1"
            },
        };

    }
 
    render() {
        return(
        <div style={{overflowY:'hidden',overflowX:'hidden'}}>         
            <div>
                <Head ref="head"/>
            </div>
        
            <div>
                <h3>{this.state.language.apptitle}</h3>
                <Basicview ref="Basicview"/>
            </div>

            <div>
                <Foot ref="foot"/>

            </div>
      
        </div>
        );
    }


}
ReactDOM.render(<App/>, document.getElementById('app'))
function jsonParse(res) {
    return res.json().then(jsonResult => ({ res, jsonResult }));
}
// function fetchJSON(){
        
//         fetch('http://127.0.0.1:8888/resource/json/data.json',
//             {
//                 method:'POST',
//                 headers:{
//                     'Access-Control-Allow-Origin':'*',
//                     'Accept': 'application/json',
//                     'Content-Type': 'application/json',
//                 },
//                 'mode': 'no-cors',
//                 body:''
//             }).then(jsonParse)
//             .then((data)=>{console.log(data)})
//             //.then(fetchlist)
//             .catch( (error) => {
//                 console.log('request error', error);
//                 return { error };
//             });
// }


