import React from 'react'
import WideGreenNotification from "./WideGreenNotification";
import WideRedNotification from "./WideRedNotification";

const Notifications = ({notifications, L, closeAction, styles}) => <div style={styles}>
    {notifications.filter(notification => notification.type === 'ok').map(notification =>
        <WideGreenNotification message={L[notification.notL10nMessage]} closeAction={() =>
            closeAction(notification.type, notification.organisaatioOid && notification.ryhmaIdList
                ? notification.organisaatioOid + notification.ryhmaIdList.join('')
                : null)} />)}
    {notifications.filter(notification => notification.type === 'error').map(notification =>
        <WideRedNotification message={L[notification.notL10nMessage]} closeAction={() =>
            closeAction(notification.type, notification.organisaatioOid && notification.ryhmaIdList
                ? notification.organisaatioOid + notification.ryhmaIdList.join('')
                : null)} /> )}
</div>;

Notifications.propTypes = {
    notifications: React.PropTypes.arrayOf(React.PropTypes.shape({
        type: React.PropTypes.string.isRequired,
        notL10nMessage: React.PropTypes.string,
    })),
    L: React.PropTypes.object.isRequired,
    closeAction: React.PropTypes.func.isRequired,
};

export default Notifications;
