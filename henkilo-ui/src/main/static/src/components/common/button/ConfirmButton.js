import './Button.css'
import React from 'react'
import Button from "./Button";
import ReactTimeout from 'react-timeout'
import NotificationButton from "./NotificationButton";

class ConfirmButton extends React.Component {

    static propTypes = {
        action: React.PropTypes.func.isRequired,
        normalLabel: React.PropTypes.string.isRequired,
        confirmLabel: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            confirmState: false,
            disabled: false,
        }
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.errorMessage && nextProps.errorMessage.errorTopic) {
            this.setState({confirmState: false, disabled: true});
            this.props.setTimeout(() => {this.setState({disabled: false})}, 2000);
        }
    };

    render() {
        const confirmProps = {...this.props, cancel: false};
        return (
            !this.state.confirmState
                ?
                <Button className={this.props.className} {...this.props} action={() => {this.setState({confirmState: true})}}
                        disabled={this.state.disabled}>
                    {this.props.normalLabel}
                </Button>
                : // Never show error message after confirm state
                <NotificationButton className={this.props.className} confirm {...confirmProps} errorMessage={null}>
                    {this.props.confirmLabel}
                </NotificationButton>
        );
    };
}


export default ReactTimeout(ConfirmButton);
