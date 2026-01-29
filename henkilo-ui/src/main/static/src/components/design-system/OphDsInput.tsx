import React from 'react';

type PageProps = {
    defaultValue?: string;
    disabled?: boolean;
    id: string;
    error?: string;
    label: string;
    onChange: (s: string) => void;
};

export const OphDsInput = ({ defaultValue, disabled, id, error, label, onChange }: PageProps) => {
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
                className={`oph-ds-input ${error ? 'oph-ds-input-error' : ''}`}
                disabled={disabled}
                autoComplete="false"
            />
            {error && <span className="oph-ds-error">{error}</span>}
        </div>
    );
};
