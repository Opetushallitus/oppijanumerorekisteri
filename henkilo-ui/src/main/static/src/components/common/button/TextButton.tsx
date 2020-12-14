import React from "react"
import PropTypes from "prop-types"
import "./TextButton.css"

const TextButton = ({children, action}) => (
    <span className="text-button" onClick={action}>
        {children}
    </span>
)

TextButton.propTypes = {
    children: PropTypes.string,
}

export default TextButton