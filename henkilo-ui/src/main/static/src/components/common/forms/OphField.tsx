import * as React from 'react';
import classNames from 'classnames';

type OphFieldProps = {
    required?: boolean;
    children: React.ReactNode;
};

const OphField = (props: OphFieldProps) => {
    const classes = classNames({
        'oph-field': true,
        'oph-field-is-required': props.required,
    });
    return <div className={classes}>{props.children}</div>;
};

export default OphField;
