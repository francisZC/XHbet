import React from "react"
import "./Drawer.css"

export default class Drawer extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            menus:[
                {name:'IAP-UBOOT烧录', link:'/burn'},
                {name:'FULL-BIN镜像制作', link:'',
                subMenu:[{name:'静态参数表', link:'/fullbin/statictable'},{name:'FULL-BIN生成', link:'/fullbin/fullbingenerate'}]},
                {name:'IAP-DWL应用下载', link:'/iap_download'},
                {name:'LpcIdScan扫描', link:'/LpcIdScan'},
            ]
        }
        this.showDrawer = this.showDrawer.bind(this)
        this.hideDrawer = this.hideDrawer.bind(this)
    }
    render(){
        this.showDrawer()
        return(
            <div id="menu">
                <div id="ensconce">
                    <h3>
                        <img src="../../../resource/img/show.png" alt="" />
                        点击这里展开
                    </h3>
                </div>
                {/* <!--显示菜单--> */}
                <div id="open">
                    <div className="navH">
                        <span><img className="obscure" src="images/obscure.png" alt="" /></span>
                    </div>
                    <div className="navBox">
                   
                               {
                                    this.state.menus.map((menu, index)=>{
                                    return   <ul>
                                                <li>
                                                <h2 class="obtain">{menu.name}<i></i></h2>

                                                { 
                                                    menu.subMenu && menu.subMenu.map((submenu, id)=>{
                                                        return <div className="secondary">
                                                        <h3>{submenu.name}</h3>
                                                        </div>
                                                    })

                                                }
                                                
                                                </li>
                                            </ul>
                                    })
                                }
                             
                           
                    </div>
                </div>
            </div>

        )
    }

    showDrawer(){

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