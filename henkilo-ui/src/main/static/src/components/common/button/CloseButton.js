import './CloseButton.css'
import React from 'react'
import PropTypes from 'prop-types'
import CloseIcon from "../icons/CloseIcon";

const CloseButton = ({closeAction}) => <span className="close-button" onClick={closeAction}><CloseIcon /></span>;

CloseButton.propTypes = {
    closeAction: PropTypes.func.isRequired,
};

export default CloseButton;
