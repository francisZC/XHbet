import React from "react"
import "./Drawer.css"

export default class Drawer extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
    }
    render(){
        return(
            <div id="drawerTop">
                <div id="hidetoSeek">
                    
                </div>
                <div className="drawer-box">
                    <span>文件</span>
                    <span>打印</span>
                    <span>读数据</span>
                    <span>二维码</span>
                </div>
            </div>
        )
    }
}