import React, { useContext, useState, useEffect, useRef } from 'react';
import {jsondeepCopy} from '../util/util'
import "./FullBinGen.css"
import FileUpload from "./upload/UploadAndGenerate"

export default class FullBinGen extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            value: '',
            height:"100%",
            width:"90%",
            margin:"0 auto",
            statictabletitle:"Configuration Static Parameters",
            boardtype:["STM3207","STM3208","STM3209"],
            staticConfiguration: {
                title:"Read Flash via Section",
                columns:["index","Enable","T","type","file/string","address","size"],
                rowdata:[
                  {
                    index:0,Enable:0,T_edit:"S",type:"STARTJUMP", filename:"startjump.bin",edit_address:"0x8000000",edit_size:16384
                  },        
                  {
                    index:1,Enable:1,T_edit:"F",type:"BOOT_CFG_FAC", filename:"startjump1.bin",edit_address:"0x8000000",edit_size:192
                  },        
                  {
                    index:2,Enable:1,T_edit:"F",type:"BOOT_CFG_APP", filename:"startjump2.bin",edit_address:"0x8000000",edit_size:192
                  },        
                  {
                    index:3,Enable:0,T_edit:"S",type:"USER_DATA_1", filename:"user_data_1_bak.bin",edit_address:"0x8000000",edit_size:16384
                  },       
                  {
                    index:4,Enable:1,T_edit:"F",type:"USER_DATA_2", filename:"user_data_2_bak.bin",edit_address:"0x8000000",edit_size:16384
                  },        
                  {
                    index:5,Enable:0,T_edit:"F",type:"IAP", filename:"iap_bak.bin",edit_address:"0x8000000",edit_size:16384
                  },        
                  {
                    index:6,Enable:0,T_edit:"S",type:"FACTORY_LOAD", filename:"facroty_load_bak.bin",edit_address:"0x8000000",edit_size:16384
                  },        
                  {
                    index:7,Enable:1,T_edit:"F",type:"APP1_LOAD", filename:"app1_load_bak.bin",edit_address:"0x8000000",edit_size:16384
                  },        
                  {
                    index:8,Enable:0,T_edit:"F",type:"APP2_LOAD", filename:"111.bin",edit_address:"0x8000000",edit_size:16384
                  }        
                ],
                button:[{"abbr":"readsave","name":"Read and Save"},{"abbr":"fullBin","name":"Create Full Bin"}]        
              }
        }
    }

    fetchJSON = (defaultBoardName) => {
        let staticConfig = this.state.staticConfiguration;

        let dataurl = 'http://localhost:8888/resource/json/'+defaultBoardName+'_config.json';
        fetch(dataurl,
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
                let resArray = JSON.parse(res)
                resArray.map((ele,id)=>{
                    let {filename, address, length, checked} = ele; 
                    console.log(filename, address, length, checked)            
                    staticConfig.rowdata[id]["filename"] = filename;
                    staticConfig.rowdata[id]["edit_address"] = address;
                    staticConfig.rowdata[id]["edit_size"] = length;
                    staticConfig.rowdata[id]["Enable"] = checked?1:0;

                })

                // [{"id":"1","filename":"111.bin","address":"123","length":"123","checked":true},
                // {"id":"2","filename":"222.bin","address":"222","length":"3333","checked":true},
                // {"id":"3","filename":"aaaa","address":"sd","length":"","checked":false},
                // {"id":"4","filename":"user_data_1_bak.bin","address":"","length":"","checked":true},
                // {"id":"5","filename":"","address":"","length":"","checked":false},
                // {"id":"6","filename":"","address":"","length":"","checked":true},
                // {"id":"7","filename":"","address":"","length":"","checked":true},
                // {"id":"8","filename":"","address":"","length":"","checked":true},
                // {"id":"9","filename":"","address":"","length":"","checked":true}]
                
                this.setState({
                  staticConfiguration: staticConfig
                })
            })
            .catch( (error) => {
                console.log('request error', error);
                return { error };
            });
      }

      changeBdType = ()=>{
        let myselect=document.getElementById("select-board-type-fullbin");
          // let myselectDefault=document.getElementById("select-default-type");
    
        let boardtype = myselect.options[myselect.selectedIndex].value;
        this.fetchJSON(boardtype);
      }
    render(){
        const new_state = this.state;
        return(
            <div style={{width:new_state.width, margin:new_state.margin}}>
                <label>选择板子类型</label>
                <select id="select-board-type-fullbin" style={{marginLeft:"10px", borderRadius:"5px"}} onChange={this.changeBdType}>
                    {new_state.boardtype.map((item, index)=>{
                    return <option id={item} value={item}>
                        {item}
                    </option>
                    })}
                </select>

                <FileUpload></FileUpload>

                <table style={{tableLayout: 'fixed'}} className="table table-striped table-bordered table-hover" id='Fullbintable'>
                <caption style={{fontFamily:"Sans-serif",fontSize:"20px",fontWeight:"bold"}}>Full Bin Table</caption>
                  <thead >
                    <tr className="info">
                    {
                        new_state.staticConfiguration.columns.map((item, index)=>{
                            return (<th style={{textAlign:"center"}} key={index} id={item}>{item}</th>)
                        })
                    }
                    </tr>
                  </thead>
                  <tbody>
                    {
                        new_state.staticConfiguration.rowdata.map((data, id)=>{
                            let rowValue = []
                            let rowKeys = []
                            rowValue=Object.values(data)
                            rowKeys=Object.keys(data)
                            return(<tr>
                                {rowValue.map((val, key)=>{
                                    return(<td id={rowKeys[key]+id}>
                                        {val}
                                    </td>)
                                })}

                            </tr>)
                        })
                    }
                </tbody>
            </table>
            <div>{new_state.staticConfiguration.button.map((btn,id)=>{
              return<button id={btn.name.replace(/\s*/g,"")} key={id} type="button" name={btn.abbr} className="btn btn-primary" style={{float:"right", marginRight:"5px"}}>{btn.name}</button>
            })}
            </div>
            </div>
        )
    }

} 