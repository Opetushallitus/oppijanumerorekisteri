import React from 'react'
import PropTypes from 'prop-types'
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
    notifications: PropTypes.arrayOf(PropTypes.shape({
        type: PropTypes.string.isRequired,
        notL10nMessage: PropTypes.string,
    })),
    L: PropTypes.object.isRequired,
    closeAction: PropTypes.func.isRequired,
};

export default Notifications;
