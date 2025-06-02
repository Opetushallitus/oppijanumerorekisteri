import React from 'react';

type Radio<T> = {
    id: T;
    label: string;
};

type PageProps<T> = {
    groupName: string;
    checked: string;
    onChange: (id: T) => void;
    radios: Radio<T>[];
};

export const OphDsRadioGroup = <T extends string>({ groupName, checked, onChange, radios }: PageProps<T>) => {
    return (
        <div className="oph-ds-radio-wrapper">
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
        </div>
    );
};
