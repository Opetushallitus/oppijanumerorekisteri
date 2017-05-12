import React from 'react'

const WideGreenNotification = ({message}) => <div className="oph-alert oph-alert-success">
    <div className="oph-alert-container">
        <div className="oph-alert-title">
            {message}
        </div>
        <button className="oph-button oph-button-close" type="button" title="Close" aria-label="Close">
            <span aria-hidden="true">×</span>
        </button>
    </div>
</div>;

WideGreenNotification.propTypes = {
    message: React.PropTypes.string,
};

export default WideGreenNotification;