import React from "react"
import "./Editable.css"
import Editable from 'react-x-editable';  
import { jsondeepCopy } from '../../util/util.js';
import { instanceOf } from "prop-types";
import ReactDOM from "react-dom";
import { Progress } from "antd";
// import {OnOff} from "jquery.onoff"
// import Switch from "react-switch"
var urlpost = "http://localhost:8888/";
export default class EditableTable extends React.Component{
  constructor(props) {
    super(props)
    this.state = {
      //第二次渲染之后，会给boardstatus更新数据
      boardstatus: '',
      progressWidth: '0%'
      
    };
    this.fetchJSON = this.fetchJSON.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.editTable = this.editTable.bind(this);
    this.jsonParse = this.jsonParse.bind(this);
    this.reverseAsTwoByte = this.reverseAsTwoByte.bind(this);
    this.PrefixInteger = this.PrefixInteger.bind(this);
    // this.updateProgress = this.updateProgress.bind(this);
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
      <div>
        {tableList}
      </div>
    )
  }

   renderTable() {
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
                                let ifEdit = rowKeys[key].indexOf('edit')
                                let ifProgress = rowKeys[key].indexOf('progress')
                                return<th id={rowKeys[key]+tableName+id} 
                                      style={{wordBreak:"break-all",  fontWeight:"normal", textAlign:"center", textOverflow:"ellipsis",overflow:"hidden"}}
                                      key={key} data-editable="true">
                                        {/* 为progress加上进度条功能，进度条动态宽度和进度值由state里面的val获取 */}
                                      {ifEdit==-1? (ifProgress==-1?val: <div className='progress' style={{height:'20px'}}>
                                                                          <div className='progress-bar' style={{width:val+'%'}}
                                                                            id={rowKeys[key]+tableName+id}>{val+'%'}
                                                                          </div>
                                                                        </div>)
                                                                          :(<a href='#' id={rowKeys[key]+tableName+id} style={{textOverflow:"ellipsis"}} data-pk='1'data-type="text">
                                                              {val}
                                                            </a>
                                                          )
                                      }

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
        insertRadioT  = "<input type='radio' style='display: inline-block' checked='checked' name ='filetype"+2*i+1+"'  id='"+idT+"' />"+"File"+" "+
      "<input type='radio' style='display: inline-block' name ='filetype"+2*i+1+"' id='"+idT+"' />"+"String"
      }else if(textT == "S"){
        insertRadioT  = "<input type='radio' style='display: inline-block'  name ='filetype"+2*i+1+"'  id='"+idT+"' />"+"File"+" "+
      "<input type='radio' style='display: inline-block' checked='checked' name ='filetype"+2*i+1+"' id='"+idT+"' />"+"String"
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

  //每两个字符前后调换
  reverseAsTwoByte(data){
    var tmp = ""
    for(let a=0; a<data.length/2;a++){
      tmp = tmp.concat(data[data.length-2*a-2]+data[data.length-2*a-1])
    }
    return tmp
  }
 
  //输出长度为length的字符串，以num结尾，长度不足在num前面补零
  PrefixInteger(num, length) {
     return (Array(length).join('0') + num).slice(-length);
  }

 
  //click button and fetch data back from 127.0.0.1:8888
   async handleClick(){
    var fileName, address, size
      let btnID = event.target.id;
      let temp = jsondeepCopy(this.state.boardstatus);

      switch(btnID){
        case "Connect":
        case "EraseFullChip":
          temp['Connect']['rowdata'][0]['progress'] = 10;
          temp['Connect']['rowdata'][0]['status'] = 'Connecting';
          this.setState({
            boardstatus:temp,
          })
          // this.updateProgress('progressConnect0', temp['Connect']['rowdata'][0]['progress']);
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
          let postBackupRestore = {
            fileName:'',
            baseAddress:'',
            sizeByte:''
          }
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
          postBackupRestore.fileName = fileName;
          postBackupRestore.baseAddress = address;
          postBackupRestore.sizeByte =  size;
          let backRestoreRet = fetch(urlpost+btnID,
            {
                method:'POST',
                headers:{
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin":"*",
                    "Access-Control-Allow-Headers":"Content-Type,Access-Token"
                },
                body: JSON.stringify(postBackupRestore)
            })
            backRestoreRet.then(res=>res.json())
              .then((data)=>{
         
               
              })
              
              .catch( (error) => {
                  console.log('request error', error);
                  return { error };
              });
          break;

        case "Burn":
          var btnName =  event.target.name
          let getAllBurnW = document.querySelectorAll("input[id^='W_editBurn']:checked")
          let getAllBurnT = document.querySelectorAll("input[id^='T_editBurn']:checked")
          let getAllBurnF = document.querySelectorAll("a[id*='file/stringBurn']")
          let getAllBurnA = document.querySelectorAll("a[id*='addressBurn']")
          let getAllBurnS = document.querySelectorAll("a[id*='sizeBurn']")
          let postReadBurn = {
            fileName:'',
            baseAddress:'',
            sizeByte:''
          }
          break;

        case "TOBOOT_CFG_APP":
          var btnName =  event.target.name
          let getAllValueInput = document.querySelectorAll("a[id^='value_input']");
          let getAllValueCalc = document.querySelectorAll("th[id^='value_calc']");
          let getAllLength = document.querySelectorAll("th[id^='lengthBootConfigEncoder']");
          let FACConfig = document.querySelector("a[id='edit_file/stringBurn1']");
          let APPConfig = document.querySelector("a[id='edit_file/stringBurn2']");
          let pattern = /[A-Fa-f]/;
          let FACString = "";
          for(let idx=0; idx<getAllValueInput.length;idx++){
            let inputString = getAllValueInput[idx].innerHTML;
            if(pattern.test(inputString)){
              getAllValueCalc[idx].innerHTML = this.reverseAsTwoByte(inputString);
              FACString +=  getAllValueCalc[idx].innerHTML;
            }else{
              //把字符串转为数字，然后再转为16进制字符串
              let inputHex = parseInt(inputString).toString(16)

              let length = getAllLength[idx].innerHTML
              let fullHex = this.PrefixInteger(inputHex, 2*length)
              getAllValueCalc[idx].innerHTML = this.reverseAsTwoByte(fullHex)
              FACString += getAllValueCalc[idx].innerHTML;
            }
          }
          FACConfig.innerHTML = FACString;
          APPConfig.innerHTML = FACString;
          break;
        case "TOBOOT_CFG_FAC":
          var btnName =  event.target.name
          var getAllValueInput = document.querySelectorAll("a[id^='value_input']")
          
          break;
        case "ReadandSave":
          var btnName =  event.target.name
          let getAllW = document.querySelectorAll("input[id^='W_editReadFlash']:checked")
          let getAllT = document.querySelectorAll("input[id^='T_editReadFlash']:checked")
          let getAllF = document.querySelectorAll("a[id*='file/stringReadFlash']")
          let getAllA = document.querySelectorAll("a[id*='addressReadFlash']")
          let getAllS = document.querySelectorAll("a[id*='sizeReadFlash']")
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
            console.log(fileNameorString)
            if(writeOrnot=="1"){
              if(inputType == "F"){
                let fetRes = await fetch(urlpost+btnID,
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
