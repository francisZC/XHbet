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
// import classNames from 'classnames';
// import '../../resource/css/font-awesome.min.css';
import './foot.css';

export default class Foot extends Component {
    constructor(props) {
        super(props);
        this.state={
            height:50,
            content:"",
            language:{
               
            }
        }
    }


    render() {
        return (

            <div className="top-level" style={{position:"relative",background:"#eeeeee",height:this.state.height,width:'100%',display:'table'}}>
               
            </div>
        );
    }
}