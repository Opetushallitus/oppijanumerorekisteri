import React from 'react'
import WideGreenNotification from "./WideGreenNotification";
import WideRedNotification from "./WideRedNotification";

const Notifications = ({notifications, L}) => <div>
    {notifications.filter(notification => notification.type === 'ok').map(notification =>
        <WideGreenNotification message={notification.notL10nMessage} />)}
    {notifications.filter(notification => notification.type === 'error').map(notification =>
        <WideRedNotification message={notification.notL10nMessage} /> )}
</div>;

Notifications.propTypes = {
    notifications: React.PropTypes.arrayOf(React.PropTypes.shape({
        type: React.PropTypes.string.isRequired,
        notL10nMessage: React.PropTypes.string,
    })),
    L: React.PropTypes.object.isRequired,
};

export default Notifications;