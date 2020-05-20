import React, { useContext, useState, useEffect, useRef } from 'react';
import Switch from '../util/Switch.js'
import {jsondeepCopy} from '../util/util'
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import "./StaticTable.css"
const urlpost = "http://localhost:8888/";
let FullStaticConfiguration = {
  boardtype:"",
  staticConfig:""
}
export default class StaticConfiguration extends React.Component{
  
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      height:"100%",
      width:"90%",
      margin:"0 auto",
      statictabletitle:"Configuration Static Parameters",
      boardtype:["type-1","type-2","type-3"],
      staticConfiguration:[
          {id:"1", filename:"startjump.bin", address:"",length:"",checked:""},
          {id:"2", filename:"aa55aa555f5f68785f5f656d616e5f74", address:"",length:"",checked:""},
          {id:"3", filename:"aa55aa555f5f68785f5f656d616e5f74", address:"",length:"",checked:""},
          {id:"4", filename:"user_data_1_bak.bin", address:"",length:"",checked:""},
          {id:"5", filename:"", address:"",length:"",checked:""},
          {id:"6", filename:"", address:"",length:"",checked:""},
          {id:"7", filename:"", address:"",length:"",checked:""},
          {id:"8", filename:"", address:"",length:"",checked:""},
          {id:"9", filename:"", address:"",length:"",checked:""},
   
        ],
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange =(event)=> {
    let staticConfig = jsondeepCopy(this.state.staticConfiguration);
    const targetId = event.target.id;
    let index = targetId.replace(/[^0-9]/ig,"");
    let field = targetId.split("-")[0]

    staticConfig[index][field] = event.target.value;
    this.setState({
      staticConfiguration: staticConfig
    });
    
  }

  handleSubmit(event) {
    event.preventDefault();
  }
  setCheckState = (ifchecked) =>{
    
    this.setState({
      isChecked : !ifchecked
    })
  }
  render() {
    
    const new_state = this.state;
    return (
      <div style={{width:new_state.width, margin:new_state.margin}}>
        <div  className="title-label"><h4>{new_state.statictabletitle}</h4><br/>
          <label>选择板子类型</label>
          <select id="select-board-type" style={{marginLeft:"10px", borderRadius:"5px"}}>
            {new_state.boardtype.map((item, index)=>{
              return <option id={item} value={item}>
                {item}
              </option>
            })}
          </select>
        </div>
        
        <form  onSubmit={this.handleSubmit}  noValidate autoComplete="off" className="statictable-form">
          {new_state.staticConfiguration.map((item, index)=>{
            return(
              <div id={"field"+index} className="field-box">
                <label id={"filename-label"+index} className="field-label">[{index+1}]FileName: </label>
                <input id={"filename-text"+index} type="text" className="field-text" value={item.filename} onChange={this.handleChange}/>
                <label id={"address-label"+index} className="field-label">Address: </label>
                <input id={"address-text"+index} type="text" className="field-text" value={item.address} onChange={this.handleChange}/>
                <label id={"length-label"+index} className="field-label">Length: </label>
                <input id={"length-text"+index} type="text" className="field-text" value={item.length} onChange={this.handleChange}/>
                <Switch id={"switch"+index} style={{float:"left"}} isChecked={this.setCheckState}></Switch>
              </div>
              
            )
          })}
          <input type="button" id="import-default" value="导入默认数据"/>
          <input type="button" id="submit" value="保存表单" onClick={this.saveFormData}/>
        </form>
      </div>
      
    );
  }
  updateStaticTable = () => {

  }

  saveFormData = () => {
    let staticConfig = jsondeepCopy(this.state.staticConfiguration);
    let allSwitch = document.getElementsByClassName("switch");
    Array.prototype.slice.call(allSwitch).map((item, index)=>{
      staticConfig[index].checked = item.checked;
    })

    this.setState({
      staticConfiguration: staticConfig
    }, function () {
      let myselect=document.getElementById("select-board-type");
      console.log(myselect.options[myselect.selectedIndex].value)
      FullStaticConfiguration.boardtype = myselect.options[myselect.selectedIndex].value;
      FullStaticConfiguration.staticConfig = this.state.staticConfiguration;

      let fetRes =  fetch(urlpost+"savedata",
      {
          method:'POST',
          headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              "Access-Control-Allow-Origin":"*",
              "Access-Control-Allow-Headers":"Content-Type,Access-Token"
          },
          mode:'no-cors',
          body: JSON.stringify(FullStaticConfiguration)
      })
      fetRes.then(res=>res.json())
        .then((data)=>{
          
        })
        
      .catch( (error) => {
          console.log('request error', error);
          return { error };
      });

      console.log('------save the data', FullStaticConfiguration)
    })
    // console.log('------save the data', staticConfiguration)
  }

  componentDidUpdate(){

  }
  componentWillUnmount(){
    console.log('componentWillUnmount-----')
  }

} 