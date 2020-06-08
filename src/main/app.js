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

import Drawer from '../container/Drawer'
import EditableTable from "../container/EditableTable"
import StaticTable from "../container/StaticTable"
import TabsControl from '../container/TabsControl'
import FullBinGen from "../container/FullBinGen"
import './App.css';
// import fetch from 'isomorphic-fetch';
// import { b64_sha1,jsondeepCopy } from '../util/util.js';
// require('es6-promise').polyfill();

class App extends Component{
    constructor(props) {
        super(props);
        this.state = {
            width: "100%",
            height: "100%",
            headfootheight: 50,
            headfootminheight: 50,
            canvasheight: 700,
            margintop:20,

            language:{
                "apptitle":"Xiaohui Bootloader Excel Tools V0.1"
            },
            drawerMsg:""
        };
    }

    getDrawMsg = (msg)=>{
        this.setState({
            drawerMsg: msg
        })
    }
    
    render() {
        return(
        <div style={{overflowY:'hidden',overflowX:'hidden', position:"relative"}}>         
       
         
            <Drawer getDrawMsg={this.getDrawMsg}></Drawer>
            <div id='mainDiv' style={{width:this.state.width, height:this.state.height, backgroundImage:"url('../resource/image/zhihe.jpg')",backgroundSize:"100% 100%",MozBackgroundSize:"100% 100%"}}>
                <h2>{this.state.language.apptitle}</h2>

                <TabsControl selectedComponent={this.state.drawerMsg}>
                    <EditableTable name="burn"></EditableTable>
                    <StaticTable name="statictable"></StaticTable>
                    <FullBinGen name="fullbingenerate"></FullBinGen>
                </TabsControl>
            </div>
      
      
        </div>
        );
    }


}
ReactDOM.render(<App/>, document.getElementById('app'))
function jsonParse(res) {
    return res.json().then(jsonResult => ({ res, jsonResult }));
}




