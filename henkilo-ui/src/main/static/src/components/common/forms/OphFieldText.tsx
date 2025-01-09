import * as React from 'react';
import classNames from 'classnames';

type OphFieldTextProps = {
    hasError?: boolean;
    children: React.ReactNode;
};

class OphFieldText extends React.Component<OphFieldTextProps> {
    render() {
        const classes = classNames({
            'oph-field-text': true,
            'oph-error': this.props.hasError,
        });
        return <div className={classes}>{this.props.children}</div>;
    }
}

export default OphFieldText;
