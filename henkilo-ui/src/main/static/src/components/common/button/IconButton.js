import './IconButton.css'
import React from 'react'

const IconButton = ({clearAction, children}) => <span className="icon-button" onClick={clearAction}>{children}</span>;

IconButton.propTypes = {
    clearAction: React.PropTypes.func.isRequired,
};

export default IconButton;
