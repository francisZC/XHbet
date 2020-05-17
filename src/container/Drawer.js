import React from "react"
import "./Drawer.css"
import EditableTable from "./EditableTable"

export default class Drawer extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            menus:[
                    {name:'IAP-UBOOT烧录', link:'/burn', id:'burn'},
                    {name:'FULL-BIN镜像制作', link:'',
                        subMenu:[
                                {name:'静态参数表', link:'/fullbin/statictable', id:'statictable'},
                                {name:'FULL-BIN生成', link:'/fullbin/fullbingenerate', id:'fullbin'}
                        ]
                    },
                    {name:'IAP-DWL应用下载', link:'/iap_download', id:'iapdownload'},
                    {name:'LpcIdScan扫描', link:'/LpcIdScan', id:'plcidscan'},
                ],
            toggleFlag: 0
        }
    }
    toTopComponent =()=>{
        console.log(this)
        this.props.getAppMsg(this, this.state)
    }
    render(){
        this.showDrawer();
        return(
            <div id="drawerTop" style={{position:"absolute"}}>
                <div id="hidetoSeek" onMouseOver={this.showDrawer} >
                    
                </div>
                <div id="bgDiv" onClick={this.hideDrawer}></div>
                <div className="drawer-box">
                {
                    this.state.menus.map((menu, index)=>{
                    return   <div>
                               
                                <li>
                                <span className="menu" link={menu.link} id={menu.id} onClick={menu.subMenu?this.toggleSubmenu:this.menuClick}>{menu.name}</span >

                                { 
                                    menu.subMenu && menu.subMenu.map((submenu, id)=>{
                                        return <div className="submenu">
                                        <h3 id={submenu.id} link={submenu.link} onClick={this.menuClick}>{submenu.name}</h3>
                                        </div>
                                    })

                                }
                                
                                </li>
                            </div>
                    })
                }
                </div>
            </div>
        )
    }

    showDrawer = ()=>{

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

    hideDrawer = ()=>{

        $('#bgDiv').css({
            display: "none",
            transition: "opacity .5s"
        });

        $('.drawer-box').css({
            left: "-15%",
            transition: "left 1s"
        });
    }

    toggleSubmenu = ()=>{
        if(this.state.toggleFlag == 0){
            $(".submenu").css({display:"block",
            transition:"1s"})
            this.state.toggleFlag = 1;
        }else if(this.state.toggleFlag == 1){
            $(".submenu").css({display:"none",
            transition:"1s"})
            this.state.toggleFlag = 0;
        }
           
    }

    menuClick = (e)=>{
        e.preventDefault();
        this.props.getDrawMsg(e.currentTarget.getAttribute('link'));
      
    }
}