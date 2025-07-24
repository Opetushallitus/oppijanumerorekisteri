import * as React from 'react';
import classNames from 'classnames';

type OphFieldTextProps = {
    hasError?: boolean;
    children: React.ReactNode;
};

const OphFieldText = (props: OphFieldTextProps) => {
    const classes = classNames({
        'oph-field-text': true,
        'oph-error': props.hasError,
    });
    return <div className={classes}>{props.children}</div>;
};

export default OphFieldText;
