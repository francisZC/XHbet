import React from "react"
import "./Drawer.css"

export default class Drawer extends React.Component{
    constructor(props){
        super(props)
        this.state = {

        }
        this.showDrawer = this.showDrawer.bind(this)
        this.hideDrawer = this.hideDrawer.bind(this)
    }
    render(){
        this.showDrawer()
        return(
            <div id="drawerTop" style={{position:"absolute"}}>
                <div id="hidetoSeek" onMouseOver={this.showDrawer} >
                    
                </div>
                <div id="bgDiv" onClick={this.hideDrawer}></div>
                <div className="drawer-box">
                    <span>文件</span>
                    <span>打印</span>
                    <span>读数据</span>
                    <span>二维码</span>
                </div>
            </div>
        )
    }

    showDrawer(){
        console.log('----show drawer')

        $('#bgDiv').css({
            width: "100%",
            display: "block",
            float: "right",
            transition: "opacity .5s"
        });

        $('.drawer-box').css({
            left: "0px",
            transition: "left 1s"
        });
    }

    hideDrawer(){
        console.log('----hide drawer')

        $('#bgDiv').css({
            display: "none",
            transition: "opacity .5s"
        });

        $('.drawer-box').css({
            left: "-15%",
            transition: "left 1s"
        });
    }
}