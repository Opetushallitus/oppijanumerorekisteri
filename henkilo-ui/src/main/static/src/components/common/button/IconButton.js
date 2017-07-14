import './IconButton.css'
import React from 'react'
import PropTypes from 'prop-types'

const IconButton = ({clearAction, children}) => <span className="icon-button" onClick={clearAction}>{children}</span>;

IconButton.propTypes = {
    clearAction: PropTypes.func.isRequired,
};

export default IconButton;
