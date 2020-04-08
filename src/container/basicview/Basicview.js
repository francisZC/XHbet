/**
 * Created by hyj on 2016/12/22.
 */

/**
 * Created by hyj on 2016/9/29.
 */
import React, {
    Component,
    PropTypes
    } from 'react';
import {Input, Table, Tag} from 'antd'
const { Column, ColumnGroup } = Table;
import classNames from 'classnames';
import Status from "./Status"
import EditableTable from "./EditableTable"
// import '../../../resource/css/font-awesome.min.css';

// require('es6-promise').polyfill();
export default class Basicview extends Component {
    constructor(props) {
        super(props);
        this.state={
            height:"100%",
            width:600,
            margin:"0 auto",
            leftview: null,
            rightview:null,
            hide:"block",
            callback:null,
            margintop:20,
            marginLeft:20,
            paddingtop:10,
            paddingleft:20,
            border:"solid 1px black",
            
        }

    }


    render() {
        console.log('this is basic view')
        return (
            <div className="loginbackground view-level" style={{position:"relative",background:"#FFFFFF",height:this.state.height,maxHeight:this.state.height,width:'90%',margin:this.state.margin,display:this.state.hide,overflow:'scroll',overflowX:'hidden',overflowY:'hidden'}}>
                <Status >
                    
                </Status>
                <div id="syspath" className="form-group" style={{marginTop:this.state.margintop, marginLeft:this.state.marginLeft,
                    paddingLeft:this.state.paddingleft, paddingTop:this.state.paddingtop,width:"80%",height:"100%"}}>
                    <EditableTable />
                </div>
                
                
            </div>
        );
    }
}