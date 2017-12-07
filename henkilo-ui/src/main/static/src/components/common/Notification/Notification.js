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
    children?: React.Node,

    // props from react-redux - YOU DON'T HAVE TO PROVIDE THESE
    notificationList: Array<string>,
    clearNotification: (key: string) => void
}

/*
 * V2 version for global notifications
 *
 * @param key: UNIQUE key for a notification somewhere in the ui
 * @param type: Notification type see https://opetushallitus.github.io/virkailija-styles/styleguide/src__modules__alerts.css.html
 * @param title: Title for notification.
 * @param children: Optional content to be added after title
 * @notificationlist: Array of unique keys from redux state - YOU DON'T HAVE TO PROVIDE THIS
 * @clearNotification: Action that cleans given notification key from redux state - YOU DON'T HAVE TO PROVIDE THIS
 */
class Notification extends React.Component<Props> {

    constructor(props: Props) {
        super(props);
    }

    render() {
        return this.props.notificationList.includes(this.props.key) ?
            <TypedNotification key={this.props.key}
                               type={this.props.type}
                               title={this.props.title}
                               closeAction={() => this.props.clearNotification(this.props.key)}>{this.props.children}</TypedNotification> :
            null;
    }

}

const mapStateToProps = (state) => ({
    notificationList: state.notificationList
});

export default connect(mapStateToProps, {clearNotification})(Notification);