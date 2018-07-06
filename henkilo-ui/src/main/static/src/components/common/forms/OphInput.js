// @flow
import React from 'react'
import classNames from 'classnames'

type OphInputProps = {
    type: string,
    name: string,
    value: string,
    onChange: (event: SyntheticEvent<HTMLInputElement>) => void,
    hasError?: boolean,
    placeholder?: string,
    disabled?: boolean,
}

class OphInput extends React.Component<OphInputProps> {

    render() {
        const classes = classNames({
            'oph-input': true,
            'oph-input-has-error': this.props.hasError,
        });
        return (
            <input
                type={this.props.type}
                id={this.props.name}
                name={this.props.name}
                value={this.props.value}
                onChange={this.props.onChange}
                className={classes}
                placeholder={this.props.placeholder}
                disabled={this.props.disabled}
            />
        );
    }

}

export default OphInput
