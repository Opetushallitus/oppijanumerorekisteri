import React from 'react';
import OphCheckboxButtonInput from './OphCheckboxButtonInput';

type Option = {
    label: string;
    value: string;
    checked: boolean;
    disabled?: boolean;
};

type OphCheckboxListProps = {
    legendText: string;
    options: Array<Option>;
    selectAction: (arg0: React.ChangeEvent<HTMLInputElement>) => void;
};

const OphCheckboxFieldset = (props: OphCheckboxListProps) => {
    const random = Math.random();

    return (
        <fieldset className="oph-fieldset">
            <legend className="oph-label">{props.legendText}</legend>
            {props.options.map((option, idx) => (
                <OphCheckboxButtonInput
                    key={random + idx}
                    idName={'label' + random + idx}
                    value={option.value}
                    label={option.label}
                    checked={option.checked}
                    disabled={option.disabled}
                    action={props.selectAction}
                />
            ))}
        </fieldset>
    );
};

export default OphCheckboxFieldset;
