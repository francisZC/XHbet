import React from 'react'
import './Switch.scss';

class Switch extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            isChecked: true
        }
    }
    
    componentDidUpdate(){
    }
    componentWillUpdate(){
    }
    render(){
        return(
            <div id={this.props.id} className ={'switch-cont'} onClick={this.btnClick}>          
                <input id={'checked_2'} className={'switch'} type="checkbox" checked={this.state.isChecked}/>
                <label ></label>
    
            </div>
        )
    }
    btnClick = (e)=>{
 
        this.props.isChecked(!this.state.isChecked);
        this.setState({
            isChecked:!this.state.isChecked
        })
    }
    
}
export default Switch;