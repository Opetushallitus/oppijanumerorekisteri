import React from 'react';
import classNames from 'classnames';

type Props = {
    inButton?: boolean;
};

function spinnerClassNames(props: Props) {
    return classNames({
        'oph-spinner': true,
        'oph-spinner-in-button': props.inButton,
    });
}

const Loader = (props: Props) => (
    <div className={spinnerClassNames(props)}>
        <div className="oph-bounce oph-bounce1" />
        <div className="oph-bounce oph-bounce2" />
        <div className="oph-bounce oph-bounce3" />
    </div>
);

export default Loader;
