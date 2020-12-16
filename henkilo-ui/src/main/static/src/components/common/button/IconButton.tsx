import './IconButton.css';
import React from 'react';
import PropTypes from 'prop-types';

const IconButton = ({ onClick, href, children }) =>
    onClick ? (
        <span className="icon-button" onClick={onClick}>
            {children}
        </span>
    ) : (
        <a href={href}>{children}</a>
    );

IconButton.propTypes = {
    onClick: PropTypes.func,
    href: PropTypes.string,
};

export default IconButton;
