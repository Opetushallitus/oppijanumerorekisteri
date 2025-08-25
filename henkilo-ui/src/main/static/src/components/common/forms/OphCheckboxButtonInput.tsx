import React from 'react';

type Props = {
    idName: string;
    value: string;
    label: string;
    checked: boolean;
    disabled?: boolean;
    action: React.ReactEventHandler<HTMLInputElement>;
};

const OphCheckboxButtonInput = (props: Props) => {
    return (
        <label htmlFor={props.idName}>
            <input
                id={props.idName}
                type="checkbox"
                value={props.value}
                checked={props.checked}
                className="oph-checkbox-button-input"
                disabled={props.disabled}
                onClick={props.action}
                onChange={() => ({})}
            />
            <span className="oph-checkbox-button-text">{props.label}</span>
        </label>
    );
};

export default OphCheckboxButtonInput;
