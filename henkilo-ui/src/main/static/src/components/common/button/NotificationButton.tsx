import React, { ReactNode } from 'react';

import Button from './Button';
import { useLocalisations } from '../../../selectors';

import './NotificationButton.css';

export type ButtonNotification = { notL10nMessage: string; notL10nText: string };

type OwnProps = {
    action?: () => void;
    disabled?: boolean;
    confirm?: boolean;
    notification?: ButtonNotification;
    removeNotification?: () => void;
    children?: ReactNode;
};

const NotificationButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const { notification, removeNotification } = props;

    return (
        <div className="popup-button" style={{ position: 'relative' }}>
            <Button {...props} />
            {notification ? (
                <div className="oph-popup oph-popup-error oph-popup-top">
                    <button
                        className="oph-button oph-button-close"
                        type="button"
                        title="Close"
                        aria-label="Close"
                        onClick={() => removeNotification && removeNotification()}
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                    <div className="oph-popup-arrow" />
                    <div className="oph-popup-title">{L(notification.notL10nMessage)}</div>
                    <div className="oph-popup-content">{L(notification.notL10nText)}</div>
                </div>
            ) : null}
        </div>
    );
};

export default NotificationButton;
