import React from 'react';

type PageProps = {
    checked: boolean;
    disabled?: boolean;
    id: string;
    label: string;
    onChange: () => void;
};

export const OphDsChechbox = ({ id, checked, disabled, label, onChange }: PageProps) => {
    return (
        <label htmlFor={id} className={`oph-ds-label ${disabled ? 'oph-ds-disabled' : ''}`}>
            <input
                id={id}
                type="checkbox"
                name={id}
                onChange={() => onChange()}
                checked={checked}
                disabled={disabled}
                className="oph-ds-checkbox"
            />
            <span aria-label={label}>{label}</span>
        </label>
    );
};
