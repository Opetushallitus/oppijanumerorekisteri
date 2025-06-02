import React, { useState } from 'react';

type PageProps = {
    id: string;
    label: string;
    onChange: () => void;
};

export const OphDsChechbox = ({ id, label, onChange }: PageProps) => {
    const [checked, setChecked] = useState(false);

    return (
        <div className="oph-ds-checkbox-wrapper">
            <label htmlFor={id} className="oph-ds-label">
                <input
                    id={id}
                    type="checkbox"
                    name={id}
                    onChange={() => {
                        onChange();
                        setChecked(!checked);
                    }}
                    className="oph-ds-chechbox"
                />
                <span aria-label={label}>{label}</span>
            </label>
        </div>
    );
};
