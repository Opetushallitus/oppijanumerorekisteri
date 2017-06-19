import './Button.css'
import React from 'react'
import {connect} from 'react-redux';
import ReactTimeout from 'react-timeout'
import NotificationButton from "./NotificationButton";

class ConfirmButton extends React.Component {

    static propTypes = {
        action: React.PropTypes.func.isRequired,
        normalLabel: React.PropTypes.string.isRequired,
        confirmLabel: React.PropTypes.string.isRequired,
        id: React.PropTypes.string.isRequired,
        disabled: React.PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.state = {
            confirmState: false,
            disabled: false,
        };
    };

    componentWillReceiveProps(nextProps) {
        if(nextProps.notifications.filter(notification => notification.id === this.props.id)[0]) {
            this.setState({confirmState: false, disabled: true});
            this.props.setTimeout(() => {this.setState({disabled: false})}, 2000);
        }
    };

    render() {
        const confirmProps = {...this.props, cancel: false};
        return (
            !this.state.confirmState
                ?
                <NotificationButton className={this.props.className}
                                    {...this.props}
                                    action={() => {this.setState({confirmState: true})}}
                                    disabled={this.state.disabled || this.props.disabled}>
                    {this.props.normalLabel}
                </NotificationButton>
                : // Never show error message after confirm state
                <NotificationButton className={this.props.className}
                                    confirm {...confirmProps}
                                    errorMessage={null}
                                    id={this.props.id}>
                    {this.props.confirmLabel}
                </NotificationButton>
        );
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        notifications: state.notifications.buttonNotifications,
    };
};

export default connect(mapStateToProps, {})(ReactTimeout(ConfirmButton));
