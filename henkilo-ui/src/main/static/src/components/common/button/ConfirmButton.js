import './Button.css'
import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux';
import ReactTimeout from 'react-timeout'
import TopOverlayNotificationButton from "./TopOverlayNotificationButton";

class ConfirmButton extends React.Component {

    static propTypes = {
        action: PropTypes.func.isRequired,
        normalLabel: PropTypes.string.isRequired,
        confirmLabel: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        disabled: PropTypes.bool,
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
                <TopOverlayNotificationButton className={this.props.className}
                                    {...this.props}
                                    action={() => {this.setState({confirmState: true})}}
                                    disabled={this.state.disabled || this.props.disabled}>
                    {this.props.normalLabel}
                </TopOverlayNotificationButton>
                : // Never show error message after confirm state
                <TopOverlayNotificationButton className={this.props.className}
                                    confirm {...confirmProps}
                                    errorMessage={null}
                                    id={this.props.id}>
                    {this.props.confirmLabel}
                </TopOverlayNotificationButton>
        );
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        notifications: state.notifications.buttonNotifications,
    };
};

export default connect(mapStateToProps, {})(ReactTimeout(ConfirmButton));
