import React from 'react';

type Props = {
    message: string;
    closeAction: () => void;
};

const WideRedNotification = ({ message, closeAction }: Props) => (
    <div className="oph-alert oph-alert-error">
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

export default WideRedNotification;
