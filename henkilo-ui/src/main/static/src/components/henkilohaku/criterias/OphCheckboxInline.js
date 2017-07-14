import React from 'react'
import PropTypes from 'prop-types'

const OphCheckboxInline = ({text, children}) =>
    <div className="oph-field oph-field-inline">
        <label className="oph-label oph-bold" aria-describedby="field-text">
            {text}
        </label>
        {children}
    </div>;

OphCheckboxInline.propTypes = {
    text: PropTypes.string.isRequired,
};

export default OphCheckboxInline;
