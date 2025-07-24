import React from 'react';
import classNames from 'classnames';

type OphInputProps = {
    type: string;
    name: string;
    value: string;
    onChange: (event: React.SyntheticEvent<HTMLInputElement>) => void;
    hasError?: boolean;
    placeholder?: string;
    disabled?: boolean;
};

const OphInput = (props: OphInputProps) => {
    const classes = classNames({
        'oph-input': true,
        'oph-input-has-error': props.hasError,
    });
    return (
        <input
            type={props.type}
            id={props.name}
            name={props.name}
            value={props.value}
            onChange={props.onChange}
            className={classes}
            placeholder={props.placeholder}
            disabled={props.disabled}
        />
    );
};

export default OphInput;
