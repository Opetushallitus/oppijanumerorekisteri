// @flow
import * as React from 'react';
import {TypedNotification} from "./TypedNotification";
import type {NotificationType} from "../../../types/notification.types";


type LocalNotificationProps = {
    type: NotificationType,
    title: string,
    toggle: boolean,
    onClose?: () => void,
    children?: React.Node
}

type State = {
    show: boolean, // Internally handled visibility. TRUE by default and set to FALSE when close action is run.
    toggle: boolean // Visibility by prop. Notification can be hidden and shown multiple times
}

/*
 * Local notification (handles its visibility internally)
 *
 * @param type: Notification type ALERT, INFO, SUCCESS, WARNING
 * @param title: Title for notification.
 * @param show: Is notification visible
 * @param onClose: Optional function to run when notification is closed
 * @param children: Optional content to be added after title https://opetushallitus.github.io/virkailija-styles/styleguide/src__modules__alerts.css.html
 */
export class LocalNotification extends React.Component<LocalNotificationProps, State> {

    state = {
        show: true,
        toggle: false
    };

    componentDidMount() {
        this.setState({toggle: this.props.toggle});
    }

    render() {
        return this.state.show && this.props.toggle ?
            <TypedNotification type={this.props.type}
                               title={this.props.title}
                               closeAction={() => this.closeAction()}>{this.props.children}</TypedNotification>
            : null;
    }

    closeAction = () => {
        this.setState({show: false});
        if(this.props.onClose) {
            this.props.onClose();
        }
    }

}