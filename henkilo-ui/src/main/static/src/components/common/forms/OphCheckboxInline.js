// @flow
import * as React from 'react'
import PropTypes from 'prop-types'

type Props = {
    text: string,
    children: React.Node | Array<React.Node>
}

const OphCheckboxInline = ({text, children}: Props) =>
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
