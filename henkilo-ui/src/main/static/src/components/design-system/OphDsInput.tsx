import React, { useEffect, useState } from 'react';
import { useDebounce } from '../../useDebounce';

type PageProps = {
    defaultValue?: string;
    disabled?: boolean;
    id: string;
    error?: string;
    type?: string;
    label: string;
    onChange: (s: string) => void;
    debounceTimeout?: number;
};

export const OphDsInput = ({
    defaultValue,
    disabled,
    id,
    error,
    label,
    onChange,
    type,
    debounceTimeout,
}: PageProps) => {
    const [value, setValue] = useState(defaultValue ?? '');
    const debounced = debounceTimeout ? useDebounce(value, debounceTimeout) : undefined;

    useEffect(() => {
        if (debounced !== undefined) {
            onChange(debounced);
        }
    }, [debounced, debounceTimeout]);

    return (
        <div>
            <label htmlFor={id} className="oph-ds-label">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type ?? 'text'}
                defaultValue={value}
                onChange={(e) => (debounceTimeout ? setValue(e.target.value) : onChange(e.target.value))}
                className={`oph-ds-input ${error !== undefined ? 'oph-ds-input-error' : ''}`}
                disabled={disabled}
                autoComplete="false"
            />
            {error && <span className="oph-ds-error">{error}</span>}
        </div>
    );
};
