import './Button.css';
import React from 'react';
import { connect } from 'react-redux';
import ReactTimeout from 'react-timeout';
import TopOverlayNotificationButton from './TopOverlayNotificationButton';

type Props = {
    action: () => void;
    setTimeout: (fn: () => void, millis: number) => void;
    normalLabel: string;
    confirmLabel: string;
    id: string;
    disabled: boolean;
    className: string;
};

type State = {
    confirmState: boolean;
    disabled: boolean;
};

class ConfirmButton extends React.Component<Props, State> {
    constructor(props) {
        super(props);
        this.state = {
            confirmState: false,
            disabled: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.notifications.filter((notification) => notification.id === this.props.id)[0]) {
            this.setState({ confirmState: false, disabled: true });
            this.props.setTimeout(() => {
                this.setState({ disabled: false });
            }, 2000);
        }
    }

    render() {
        const confirmProps = { ...this.props, cancel: false, action: this.action };
        return !this.state.confirmState ? (
            <TopOverlayNotificationButton
                className={this.props.className}
                {...this.props}
                action={() => {
                    this.setState({ confirmState: true });
                }}
                disabled={this.state.disabled || this.props.disabled}
            >
                {this.props.normalLabel}
            </TopOverlayNotificationButton> // Never show error message after confirm state
        ) : (
            <TopOverlayNotificationButton
                className={this.props.className}
                confirm
                {...confirmProps}
                errorMessage={null}
                id={this.props.id}
            >
                {this.props.confirmLabel}
            </TopOverlayNotificationButton>
        );
    }

    action = () => {
        this.setState({
            confirmState: false,
        });
        this.props.action();
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        notifications: state.notifications.buttonNotifications,
    };
};

export default connect(mapStateToProps, {})(ReactTimeout(ConfirmButton));
