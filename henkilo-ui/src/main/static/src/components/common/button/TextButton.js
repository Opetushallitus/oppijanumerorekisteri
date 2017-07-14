import React from 'react';
import './TextButton.css';

const TextButton = ( {children, action} ) =>
    <span className="text-button" onClick={action}>{children}</span>;

TextButton.propTypes = {
    children: React.PropTypes.string
};

export default TextButton;
