import React from 'react';

type Radio<T> = {
    id: T;
    label: string;
};

type PageProps<T> = {
    checked: string;
    legend?: string;
    groupName: string;
    onChange: (id: T) => void;
    radios: Radio<T>[];
};

export const OphDsRadioGroup = <T extends string>({ groupName, checked, onChange, legend, radios }: PageProps<T>) => {
    return (
        <fieldset role="radiogroup" className="oph-ds-radio-wrapper">
            <legend>{legend}</legend>
            {radios.map(({ id, label }) => (
                <label htmlFor={id} key={`radio-${id}`} className="oph-ds-label">
                    <input
                        id={id}
                        name={groupName}
                        type="radio"
                        onChange={() => onChange(id)}
                        checked={checked === id}
                        className="oph-ds-radio"
                    />
                    <span aria-label={label}>{label}</span>
                </label>
            ))}
        </fieldset>
    );
};
