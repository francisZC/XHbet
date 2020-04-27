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
                    <h2>
                        <img src="images/show.png" alt="" />
                        点击这里展开
                    </h2>
                </div>
                {/* <!--显示菜单--> */}
                <div id="open">
                    <div class="navH">
                        <span><img class="obscure" src="images/obscure.png" alt="" /></span>
                    </div>
                    <div class="navBox">
                        <ul>
                            <li>
                                <h2 class="obtain"><i></i></h2>
                                <div class="secondary">
                                    <h3>故宫</h3>
                                    <h3>十三陵</h3>
                                </div>
                            </li>
                            <li>
                                <h2 class="obtain">南京景点<i></i></h2>
                                <div class="secondary">
                                    <h3>栖霞寺</h3>
                                    <h3>夫子庙</h3>
                                    <h3>海底世界</h3>
                                    <h3>中山陵</h3>
                                    <h3>乌衣巷</h3>
                                    <h3>音乐台</h3>
                                </div>
                            </li>
                            <li>
                                <h2 class="obtain">上海景点<i></i></h2>
                                <div class="secondary">
                                    <h3>东方明珠</h3>
                                    <h3>外滩</h3>
                                    <h3>豫园</h3>
                                    <h3>文庙</h3>
                                    <h3>世博园</h3>
                                    <h3>田子坊</h3>
                                </div>
                            </li>
                            <li>
                                <h2 class="obtain">深圳景点<i></i></h2>
                                <div class="secondary">
                                    <h3>华侨城</h3>
                                    <h3>观澜湖</h3>
                                    <h3>世界之窗</h3>
                                    <h3>东门老街</h3>
                                    <h3>七娘山</h3>
                                    <h3>光明农场</h3>
                                </div>
                            </li>
                            <li>
                                <h2 class="obtain">广州景点<i></i></h2>
                                <div class="secondary">
                                    <h3>白云山</h3>
                                    <h3>长隆</h3>
                                    <h3>黄花岗公园</h3>
                                    <h3>中山纪念堂</h3>
                                    <h3>华南植物园</h3>
                                    <h3>南沙湿地公园</h3>
                                </div>
                            </li>
                        </ul>
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