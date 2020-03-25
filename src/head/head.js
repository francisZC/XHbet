/**
 * Created by hyj on 2016/9/28.
 */
import React, {
    Component,
    PropTypes
    } from 'react';
/*
 import {
 AppRegistry,
 StyleSheet,
 Text,
 View,
 PixelRatio
 } from 'react-native';*/
import classNames from 'classnames';
// import '../../resource/css/font-awesome.min.css';
import './head.css';

export default class Head extends Component {
    constructor(props) {
        super(props);
        this.state={
            height:50,
            username:"",
            "loginfo":"xxxxxxxxx",
            "clock":"xx-xx-xx xx:xx",
            hideUser:"none",
            hide:"table",
            language:{
                "icon":"",
                "nologin":"no login",
                "title":"智能模式生物检测平台",
                "greet":"Hello"
            }
        }
    }
   
    render() {
        let temp = this.state.language.greet+this.state.username;
        if(this.state.username === ""){
            temp = this.state.language.greet;
        }
        return (
            <div className="top-level" style={{position:"relative",background:"#eeeeee",height:this.state.height,width:'100%',display:this.state.hide}}>
                <div style={{position:"relative",background:"#eeeeee",height:this.state.height,width:'33%',display:'table',float:"left"}}>
                </div>
                <div style={{position:"relative",background:"#eeeeee",height:this.state.height,width:'33%',display:'table',float:"left"}}>
                  
                </div>
                <div style={{position:"relative",background:"#eeeeee",height:this.state.height,width:'33%',display:'table',float:"left"}}>

                </div>
            </div>
        );
    }
}