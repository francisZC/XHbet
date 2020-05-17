var React=require("react");

export default class TabsControl extends React.Component{

    constructor(props){
        super(props);
        this.state={ 
            currentIndex : 0
        };
    }

    check_item_index(compName){
        const getCompName = this.props.selectedComponent.split('/').slice(-1)[0]
        return compName=== getCompName ? {display:'block'} : {display:'none'};
    }

    render(){
        let _this=this;
        return(
            <div>

                {/*Tab内容区域*/}
                <div className="Tab_item_wrap">
                    {React.Children.map(this.props.children,(element,index)=>{
                        let componentName = element.props.name;
                        return(
                            <div style={ this.check_item_index(componentName) }>{ element }</div>
                            );
                    })}
                </div>
            </div>
            );
    }
}