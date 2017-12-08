// @flow
import * as React from 'react';
import {connect} from 'react-redux';
import {TypedNotification} from "./TypedNotification";
import {clearNotification} from "../../../actions/notification.actions";
import type {NotificationType} from "../../../types/notification.types";


type Props = {
    key: string,
    type: NotificationType,
    title: string,
    onClose?: () => void,
    children?: React.Node,

    // props from react-redux - YOU DON'T HAVE TO PROVIDE THESE
    notificationList: Array<string>,
    clearNotification: (key: string) => void
}

/*
 * Global notifications ( visibility of a particular notification is defined in redux state )
 *
 * @param key: UNIQUE key for a notification somewhere in the ui
 * @param type: Notification type ALERT, INFO, SUCCESS, WARNING
 * @param title: Title for notification.
 * @param onClose: Optional function to run when notification is closed
 * @param children: Optional content to be added after title https://opetushallitus.github.io/virkailija-styles/styleguide/src__modules__alerts.css.html
 * @param notificationlist: Array of unique keys from redux state - YOU DON'T HAVE TO PROVIDE THIS
 * @param clearNotification: Action that cleans given notification key from redux state - YOU DON'T HAVE TO PROVIDE THIS
 */
class GlobalNotification extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return this.props.notificationList.includes(this.props.key) ?
            <TypedNotification type={this.props.type}
                               title={this.props.title}
                               closeAction={() => this.closeAction(this.props.key) }>{this.props.children}</TypedNotification> :
            null;
    }

    closeAction = (key: string): void => {
        this.props.clearNotification(key);
        if(this.props.onClose) {
            this.props.onClose();
        }
    }

}

const mapStateToProps = (state) => ({
    notificationList: state.notificationList
});

export default connect(mapStateToProps, {clearNotification})(GlobalNotification);