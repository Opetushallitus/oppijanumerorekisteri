import React from 'react';

type WideGreenNotificationProps = {
    message: string;
    closeAction: () => void;
};

const WideGreenNotification = ({ message, closeAction }: WideGreenNotificationProps) => (
    <div className="oph-alert oph-alert-success">
        <div className="oph-alert-container">
            <div className="oph-alert-title">{message}</div>
            <button
                className="oph-button oph-button-close"
                type="button"
                title="Close"
                aria-label="Close"
                onClick={closeAction}
            >
                <span aria-hidden="true">×</span>
            </button>
        </div>
    </div>
);

export default WideGreenNotification;
