import React from 'react';

type PageProps = {
    id: string;
    label: string;
    onChange: (s: string) => void;
};

export const OphDsInput = ({ id, label, onChange }: PageProps) => {
    return (
        <div>
            <label htmlFor={id} className="oph-ds-label">
                {label}
            </label>
            <div className="oph-ds-input-wrapper">
                <input
                    id={id}
                    name={id}
                    type="text"
                    onChange={(e) => onChange(e.target.value)}
                    className="oph-ds-input"
                />
            </div>
        </div>
    );
};
