import './Button.css'
import React from 'react'
import Button from "./Button";

export default class ConfirmButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmState: false,
        }
    }

    static propTypes = {
        action: React.PropTypes.func.isRequired,
        normalLabel: React.PropTypes.string.isRequired,
        confirmLabel: React.PropTypes.string.isRequired,
    };

    render() {
        return (
            !this.state.confirmState
                ?
                <Button className={this.props.className} {...this.props} action={() => {this.setState({confirmState: true})}}>
                    {this.props.normalLabel}
                </Button>
                :
                <Button className={this.props.className} confirm {...this.props} >
                    {this.props.confirmLabel}
                </Button>
        );
    }
}

