import React from "react"
import "./Editable.css"
import Editable from 'react-x-editable';  
export default class EditableTable extends React.Component{
  constructor(props) {
    super(props)

    this.state = {
      //empty column is for button
      boardstatus:{
          "Connect":{
              "title":"Step1 Connect to the board",
              "columns":["progess","status"],
              "rowdata":[
                {
                  "progress":20,
                  "status":"OK"
                }
              ],
              "button":["Connect"]
              
          },
          "Erase":{
              "title":"Step2 Before burn anything to FLASH, Erase Full Chip",
              "columns":["progress","status"],
              "rowdata":[
                {
                
                  "progress":100,
                  "status":"Erased OK"
                  
                }
              ],
              "button":["Erase Full Chip"]
              
          },
          "Backup":{
               "columns":["method","filename","address","size","progress","status"],
             "rowdata":[
                   { 
                     "method":"backup",   
                    "filename_edit":"stm32f207_backup.bin",
                    "address_edit":"0x80000000",
                    "size":2048,
                    "progress":100,
                    "status":"Saved OK"
                  },
                  {
                    "method":"restore",
                    "filename_edit":"test.bin",
                    "address_edit":"0x80000000",
                    "size":2048,
                    "progress":100,
                    "status":"Saved OK"
                  }
              ],
              "button":["Backup Full Chip","Restore Full Chip"]
                
          },
          "Burn":{
            "title":"Step4 Burn Flash via Section(W=1, Write, W=0,skip, T=F, from file, T=S, from Hex String)",
            "columns":["index","W","T","type","file/string","address","size","progress","status"],
            "rowdata":[
              {
                "index":0,
                "W_edit":0,
                "T_edit":"F",
                "type":"STARTJUMP",
                "file/string_edit":"startjump.bin",
                "address_edit":"0x80000000",
                "size":2048,
                "progress":100,
                "status":"Verify OK"
              },
              {
                "index":1,
                "W_edit":1,
                "T_edit":"F",
                "type":"STARTJUMP",
                "file/string_edit":"startjump.bin",
                "address_edit":"0x80000000",
                "size":2048,
                "progress":100,
                "status":"Verify OK"
              }
            ],
            "button":["Burn"]
          },
          "BootConfigEncoder":{
            "title":"Step4.1 BOOT CONFIG ENCODER (PLEASE FILL ONLY GREEN CELL)",
            "columns":["offset","length","type","name","value_input","value_calc","data_type","Fill","Temp","Valid"],
            "rowdata":[
                {
                  "offset":0,
                  "length":2,
                  "type":"UINT32",
                  "name":"initBurnFlag",
                  "value_input_edit":"55AA55AA",
                  "value_calc":"",
                  "datatype":"hex",
                  "Fill":"0000",
                  "Temp":"0708",
                  "Valid":4,
                },
                {
                  "offset":0,
                  "length":2,
                  "type":"UINT32",
                  "name":"initBurnFlag",
                  "value_input_edit":"55AA55AA",
                  "value_calc":"",
                  "datatype":"hex",
                  "Fill":"0000",
                  "Temp":"0708",
                  "Valid":4,
                }
            ],
            "button":[
              "TO BOOT_CFG_FAC",
              "TO BOOT_CFG_APP"
            ]
          },
          "CheckFileLength":{
            "title":"Check File Length",
            "columns":["IAP","FACTORY_LOAD","APP1_LOAD","APP2_LOAD","status"],
            "rowdata":[
              {
                "IAP_edit":"iap.bin",
                "FACTORY_LOAD_edit":"facotry.bin",
                "APP1_LOAD_edit":"app1_load.bin",
                "APP2_LOAD_edit":"app2_load.bin",
                "status":"Check OK"
              }              
            ],
            "button":["Check File Length"]            
          },
          "ReadFlash":{
            "title":"Step5 Read Flash via Section",
            "columns":["index","W","T","type","file/string","address","size","progress","status"],
            "rowdata":[
              {
                "index":0,
                "W_edit":0,
                "T_edit":"F",
                "type":"STARTJUMP",
                "file/string_edit":"startjump.bin",
                "address_edit":"0x80000000",
                "size":2048,
                "progress":100,
                "status":"Verify OK",
                
              }        
            ],
            "button":["Read and Save"]        
          },
          "BootConfigDecoder":{
            "title":"Step5.1 BOOT CONFIG DECODER",
            "columns":["offset","length","type","name","value_output","value_calc","data_type","Fill","Temp","Valid"],
            "rowdata":[
                {
                  "offset":0,
                  "length":2,
                  "type":"UINT32",
                  "name":"initBurnFlag",
                  "value_input_edit":"55AA55AA",
                  "value_calc":"",
                  "datatype":"hex",
                  "Fill":"0000",
                  "Temp":"0708",
                  "Valid":4,
                },
                {
                  "offset":0,
                  "length":2,
                  "type":"UINT32",
                  "name":"initBurnFlag",
                  "value_input_edit":"55AA55AA",
                  "value_calc":"",
                  "datatype":"hex",
                  "Fill":"0000",
                  "Temp":"0708",
                  "Valid":4,
                }
                
            ],
            "button":[
              "FROM BOOT_CFG_FAC",
              "FROM BOOT_CFG_APP"
            ]
          }
      }
      
    };
    
    this.renderTable = this.renderTable.bind(this)
  };
  componentDidMount(){
    console.log("componentWillUpdate------")
    this.editTable()
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
    var tableList = [];
      for(var tableName in this.state.boardstatus ){
        tableList.push(
          <div>
              <table className="table table-striped table-bordered table-hover" id='Editable' key={tableName}>
                <caption style={{align:"center"}}>{this.state.boardstatus[tableName].title}</caption>
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
                                
                                return<th style={{fontWeight:"normal", textAlign:"center"}} key={key} data-editable="true">
                                   {chooseOne==-1? val:(<a href='#' id={rowKeys[key]+tableName+id}  data-pk='1'>{val}</a>)}
                            
                                </th>
                          })}
                          </tr>
                      })
                    }
                </tbody>
            </table>
            <div>{this.state.boardstatus[tableName].button.map((btn,id)=>{
              console.log(btn, typeof(btn))
              return<button id={btn.replace(/\s*/g,"")} key={id} type="button" className="btn btn-primary" style={{float:"right", marginRight:"5px"}}>{btn}</button>
            })}</div>
          </div>
         
        )
    }
    return tableList;
  }
  
  editTable = function () {
    
    $("a[id^='W']").editable(
      
      {
        type: 'select',
        value: 2,    
        source: [
              {value: 1, text: '0'},
              {value: 2, text: '1'}
           ]
      }
    );
    $("a[id^='T']").editable(
      
      {
        type: 'select',
        value: 2,    
        source: [
              {value: 1, text: 'F'},
              {value: 2, text: 'S'}
           ]
      }
    );
    $("a").editable(
      
  
      
      );
  }
    


  
}



