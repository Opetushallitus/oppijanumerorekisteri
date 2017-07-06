import './CrossButton.css'
import React from 'react'
import CrossIcon from "../icons/CrossIcon";

const CrossButton = ({clearAction}) => <span className="cross-button" onClick={clearAction}><CrossIcon /></span>;

CrossButton.propTypes = {
    clearAction: React.PropTypes.func.isRequired,
};

export default CrossButton;
