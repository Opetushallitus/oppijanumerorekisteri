import React from 'react'

const OphCheckboxInline = ({text, children}) =>
    <div className="oph-field oph-field-inline">
        <label className="oph-label oph-bold" aria-describedby="field-text">
            {text}
        </label>
        {children}
    </div>;

OphCheckboxInline.propTypes = {
    text: React.PropTypes.string.isRequired,
};

export default OphCheckboxInline;
