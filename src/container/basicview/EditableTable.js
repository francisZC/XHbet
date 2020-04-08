import React from "react"
import "./Editable.css"
import Editable from 'react-x-editable';  
import { jsondeepCopy } from '../../util/util.js';
import { instanceOf } from "prop-types";
// import {OnOff} from "jquery.onoff"
// import Switch from "react-switch"
var urlpost = "http://localhost:8888/";
export default class EditableTable extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      //empty column is for button
      boardstatus: ''
      
    };
    this.fetchJSON = this.fetchJSON.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.editTable = this.editTable.bind(this);
    this.jsonParse = this.jsonParse.bind(this);
  };
  componentDidMount(){
    this.fetchJSON()
  }
  
  
  fetchJSON(){   
    fetch('http://localhost:8888/resource/json/tableRawData.json',
        {
            method:'POST',
            headers:{
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body:''
        }).then((data)=>{  
            return data.json()
        })
        .then((res)=>{

            this.setState({
              boardstatus:JSON.parse(res)
            })
        })
        .catch( (error) => {
            console.log('request error', error);
            return { error };
        });
  }

  
  render(){
    
    let tableList = this.renderTable()
    return(
      <div style={{marginRight:"20px"}}>
        {tableList}
      </div>
    )
  }

   renderTable() {
     console.log('this is render table')
    var tableList = [];
      for(var tableName in this.state.boardstatus ){
        tableList.push(
          <div>
              <table style={{tableLayout: 'fixed'}} className="table table-striped table-bordered table-hover" id='Editable' key={tableName}>
                <caption style={{fontFamily:"Sans-serif",fontSize:"20px",fontWeight:"bold"}}>{this.state.boardstatus[tableName].title}</caption>
                  <thead >
                    <tr className="info">
                      {
                          this.state.boardstatus[tableName].columns.map((item, index)=>{
                          return (<th style={{textAlign:"center"}} key={index}>{item}</th>)
                        })
                      }
                    </tr>
                  </thead>
                  <tbody>
                    { 
                      this.state.boardstatus[tableName].rowdata.map((data, id)=>{
                        let buttonList=[]
                        //data is Object type, need to tranform to Array to use map function
                        let rowValue = []
                        let rowKeys = []
                          rowValue=Object.values(data)
                          rowKeys=Object.keys(data)
                          return <tr key={id}>
                              {rowValue.map((val,key)=>{
                                let chooseOne = rowKeys[key].indexOf('edit')
                                return<th id={rowKeys[key]+tableName+id} style={{fontWeight:"normal", textAlign:"center", textOverflow:"ellipsis",overflow:"hidden", whiteSpace:"nowrap"}} key={key} data-editable="true">
                                   {chooseOne==-1? val:(<a href='#' id={rowKeys[key]+tableName+id} style={{textOverflow:"ellipsis"}} data-pk='1'data-type="text">{val}</a>)}
                                </th>
                          })}
                          </tr>
                      })
                    }
                </tbody>
            </table>
            <div>{this.state.boardstatus[tableName].button.map((btn,id)=>{
              return<button id={btn.name.replace(/\s*/g,"")} key={id} type="button" name={btn.abbr} className="btn btn-primary" style={{float:"right", marginRight:"5px"}}
              onClick={this.handleClick.bind(this)}>{btn.name}</button>
            })}</div>
          </div>
         
        )
    }
    return tableList;
  }

   componentDidUpdate(){
  //after the second time render(fetch json from server and update this.state.boardstatus)
   this.editTable()
     
  }

  editTable () {
    //W and T table have select and options
    let $inputW = $("a[id^='W']")
    let $inputT = $("a[id^='T']")
    let insertRadioW = "", insertRadioT = "";
    console.log('--------input T-----------',$inputT)
    for(let i=0; i<$inputW.length;i++){
      let htmlW = $inputW.get(i).innerHTML
      let textW = $inputW.get(i).innerText
      let htmlT = $inputT.get(i).innerHTML
      let textT = $inputT.get(i).innerText
      let idW = $inputW.get(i).id
      let idT = $inputT.get(i).id

      if(textW == "0"){
        insertRadioW  = "<input type='radio' style='display: inline-block' checked='checked' name ='write"+2*i+"'  id='"+idW+"' />"+0+" "+
        "<input type='radio' style='display: inline-block' name ='write"+2*i+"' id='"+idW+"' />"+1
      }else if(textW == "1"){
        insertRadioW  = "<input type='radio' style='display: inline-block' name ='write"+2*i+"'  id='"+idW+"' />"+0+" "+
      "<input type='radio' style='display: inline-block'  checked='checked' name ='write"+2*i+"' id='"+idW+"' />"+1
      }
      
      if(textT == "F"){
        insertRadioT  = "<input type='radio' style='display: inline-block' checked='checked' name ='filetype"+2*i+1+"'  id='"+idT+"' />"+"F"+" "+
      "<input type='radio' style='display: inline-block' name ='filetype"+2*i+1+"' id='"+idT+"' />"+"S"
      }else if(textT == "S"){
        insertRadioT  = "<input type='radio' style='display: inline-block'  name ='filetype"+2*i+1+"'  id='"+idT+"' />"+"F"+" "+
      "<input type='radio' style='display: inline-block' checked='checked' name ='filetype"+2*i+1+"' id='"+idT+"' />"+"S"
      }
      
      
      $inputW[i].outerHTML = insertRadioW
      $inputT[i].outerHTML = insertRadioT
   
     
    }

    // $('input[type=checkbox]').onoff();
    



    $("a").editable(
        {
          validate:function (value) {
          }
        }
      );
  }

  jsonParse(res) {
    return res.json().then(jsonResult => ({ res, jsonResult }));
  }

  //click button and fetch data back from 127.0.0.1:8888
  handleClick(){
    var fileName, address, size
      let btnID = event.target.id;
      let temp = jsondeepCopy(this.state.boardstatus);
      switch(btnID){
        case "Connect":
        case "EraseFullChip":
          let postdata ='';
          let fetRes = fetch(urlpost+btnID,
            {
                method:'POST',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: postdata
            })
            fetRes.then(res=>res.json())  //res.json() can only be called once, can't be called in console.log() before this.

              .then((data)=>{
                console.log('----return-----',data, typeof(data))
                temp['Connect']['rowdata'][0]['progress'] = data['progress'];
                temp['Connect']['rowdata'][0]['status'] = data['status'];
                this.setState({
                  boardstatus:temp
                })
              })
              
              .catch( (error) => {
                  console.log('request error', error);
                  return { error };
              });
          break;

        case "RestoreFullChip":
        case "BackupFullChip":
          var btnName =  event.target.name
          var getAllA = document.querySelectorAll("a")
          try{
            for(var idx in getAllA){
              if(getAllA[idx].id == undefined)
                break;
              if(getAllA[idx].id.indexOf(btnName)==0 && getAllA[idx].id.indexOf('filename')!=-1){
                fileName = getAllA[idx].innerHTML
              }
              if(getAllA[idx].id.indexOf(btnName)==0 && getAllA[idx].id.indexOf('address')!=-1){
                address = getAllA[idx].innerHTML
              }
              if(getAllA[idx].id.indexOf(btnName)==0 && getAllA[idx].id.indexOf('size')!=-1){
                size = getAllA[idx].innerHTML
              }
            }
          }
          catch(error){
            console.log(error)
          }          
          console.log(btnID,fileName,address,size )
          break;

        case "Burn":
          var btnName =  event.target.name
          var getAllA = document.querySelectorAll("a")
          try{
            for(var idx in getAllA){
              if(getAllA[idx].id == undefined)
                break;
              console.log(btnName)
              if(getAllA[idx].id.indexOf(btnName)!=-1 && getAllA[idx].id.indexOf('file/string')!=-1){
                fileName = getAllA[idx].innerHTML
              }
              if(getAllA[idx].id.indexOf(btnName)!=-1 && getAllA[idx].id.indexOf('address')!=-1){
                address = getAllA[idx].innerHTML
              }
            }
          }
          catch(error){
            console.log(error)
          }          
          console.log(btnID,fileName,address,size )
          break;

        case "TOBOOT_CFG_APP":
          var btnName =  event.target.name
          var getAllA = document.querySelectorAll("a")
          
          console.log(btnID,fileName,address,size )
          break;

        case "ReadandSave":
          let btnName =  event.target.name
          let getAllW = document.querySelectorAll("input[id^='W_editReadFlash']:checked")
          let getAllT = document.querySelectorAll("input[id^='T_editReadFlash']:checked")
          let getAllF = document.querySelectorAll("a[id^='file/string']")
          let getAllA = document.querySelectorAll("a[id^='address']")
          let getAllS = document.querySelectorAll("a[id^='size']")
          let postRead = {
            fileName:'',
            baseAddress:'',
            sizeByte:''
          }
          for(let i=0; i<getAllW.length;i++){
            let writeOrnot = getAllW[i].nextSibling.nodeValue.trim();
            let inputType = getAllT[i].nextSibling.nodeValue.trim();
            let fileNameorString = getAllF[i].text;
            let baseAddress = getAllA[i].text;
            let sizeByte = getAllS[i].text;
            
            postRead.fileName = fileNameorString;
            postRead.baseAddress = baseAddress;
            postRead.sizeByte =  sizeByte;
            
            if(writeOrnot=="1"){
              if(inputType == "F"){
                let fetRes = fetch(urlpost+btnID,
                  {
                      method:'POST',
                      headers:{
                          'Accept': 'application/json',
                          'Content-Type': 'application/json',
                          "Access-Control-Allow-Origin":"*",
                          "Access-Control-Allow-Headers":"Content-Type,Access-Token"
                      },
                      body: JSON.stringify(postRead)
                  })
                  fetRes.then(res=>res.json())
                    .then((data)=>{
               
                     
                    })
                    
                    .catch( (error) => {
                        console.log('request error', error);
                        return { error };
                    });
              }
            }
            
          }
          
          break;
          
      }
    
  }
}
