import './Button.css'
import React from 'react'
import Button from "./Button";
import ReactTimeout from 'react-timeout'

class ConfirmButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            confirmState: false,
            disabled: false,
        }
    };

    static propTypes = {
        action: React.PropTypes.func.isRequired,
        normalLabel: React.PropTypes.string.isRequired,
        confirmLabel: React.PropTypes.string.isRequired,
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.errorMessage && nextProps.errorMessage.errorTopic) {
            this.setState({confirmState: false, disabled: true});
            this.props.setTimeout(() => {this.setState({disabled: false})}, 2000);
        }
    };

    render() {
        return (
            !this.state.confirmState
                ?
                <Button className={this.props.className} {...this.props} action={() => {this.setState({confirmState: true})}}
                        disabled={this.state.disabled}>
                    {this.props.normalLabel}
                </Button>
                : // Never show error message after confirm state
                <Button className={this.props.className} confirm {...this.props} errorMessage={null}>
                    {this.props.confirmLabel}
                </Button>
        );
    };
}

export default ReactTimeout(ConfirmButton);
