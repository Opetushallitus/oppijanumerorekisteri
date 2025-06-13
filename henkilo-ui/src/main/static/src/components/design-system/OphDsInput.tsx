import React from 'react';

type PageProps = {
    defaultValue?: string;
    id: string;
    label: string;
    onChange: (s: string) => void;
};

export const OphDsInput = ({ defaultValue, id, label, onChange }: PageProps) => {
    return (
        <div>
            <label htmlFor={id} className="oph-ds-label">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type="text"
                defaultValue={defaultValue}
                onChange={(e) => onChange(e.target.value)}
                className="oph-ds-input"
            />
        </div>
    );
};
