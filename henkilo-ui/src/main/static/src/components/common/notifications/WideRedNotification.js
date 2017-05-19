import React from 'react'

const WideRedNotification = ({message, closeAction}) => <div className="oph-alert oph-alert-error">
    <div className="oph-alert-container">
        <div className="oph-alert-title">{message}</div>
        <button className="oph-button oph-button-close" type="button" title="Close" aria-label="Close" onClick={closeAction}>
            <span aria-hidden="true">×</span>
        </button>
    </div>
</div>;

WideRedNotification.propTypes = {
    message: React.PropTypes.string,
    closeAction: React.PropTypes.func.isRequired,
};

export default WideRedNotification;