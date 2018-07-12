// @flow
import * as React from 'react'
import classNames from 'classnames'

type OphFieldProps = {
    required?: boolean,
    children: React.Node,
}

class OphField extends React.Component<OphFieldProps> {

    render() {
        const classes = classNames({
            'oph-field': true,
            'oph-field-is-required': this.props.required,
        });
        return (
            <div className={classes}>
                {this.props.children}
            </div>
        );
    }

}

export default OphField
