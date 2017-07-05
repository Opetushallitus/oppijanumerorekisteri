import './CloseButton.css'
import React from 'react'
import CloseIcon from "../icons/CloseIcon";

const CloseButton = ({closeAction}) => <span className="close-button" onClick={closeAction}><CloseIcon /></span>;

CloseButton.propTypes = {
    closeAction: React.PropTypes.func.isRequired,
};

export default CloseButton;
