import React from 'react';

type PageProps = {
    checked: boolean;
    id: string;
    label: string;
    onChange: () => void;
};

export const OphDsChechbox = ({ id, checked, label, onChange }: PageProps) => {
    return (
        <label htmlFor={id} className="oph-ds-label">
            <input
                id={id}
                type="checkbox"
                name={id}
                onChange={() => onChange()}
                checked={checked}
                className="oph-ds-chechbox"
            />
            <span aria-label={label}>{label}</span>
        </label>
    );
};
