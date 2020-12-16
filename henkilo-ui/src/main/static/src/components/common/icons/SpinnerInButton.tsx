import React from 'react';

type Props = { show: boolean };

export const SpinnerInButton = (props: Props) =>
    props.show ? (
        <span className="oph-spinner oph-spinner-in-button">
            <span className="oph-bounce oph-bounce1" aria-hidden="true"></span>
            <span className="oph-bounce oph-bounce2" aria-hidden="true"></span>
            <span className="oph-bounce oph-bounce3" aria-hidden="true"></span>
        </span>
    ) : null;
