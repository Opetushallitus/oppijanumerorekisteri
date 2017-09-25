import "./FloatingBar.css";
import React from 'react';

export const FloatingBar = (props) => {
    return <div id="floating-bar"><span className="floating-bar-content">{props.children}</span></div>
};