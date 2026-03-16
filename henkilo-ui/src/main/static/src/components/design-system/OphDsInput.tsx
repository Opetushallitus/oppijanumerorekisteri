import React, { useEffect, useRef, useState } from 'react';

import { useDebounce } from '../../useDebounce';
import { useLocalisations } from '../../selectors';

type PageProps = {
    defaultValue?: string;
    disabled?: boolean;
    id: string;
    error?: string;
    type?: string;
    label: string;
    onChange: (s: string) => void;
    debounceTimeout?: number;
    placeholder?: string;
    icon?: 'search';
    isClearable?: boolean;
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
    placeholder,
    icon,
    isClearable,
}: PageProps) => {
    const { L } = useLocalisations();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [value, setValue] = useState(defaultValue ?? '');
    const debounced = debounceTimeout ? useDebounce(value, debounceTimeout) : undefined;
    const iconClass = icon ? `oph-ds-input-icon oph-ds-input-icon-${icon}` : '';
    const clearButtonClass = isClearable ? 'oph-ds-input-clearable' : '';

    useEffect(() => {
        if (debounced !== undefined) {
            onChange(debounced);
        }
    }, [debounced, debounceTimeout]);

    const handleClear = () => {
        setValue('');
        inputRef.current?.focus();
    };

    return (
        <div>
            <label htmlFor={id} className="oph-ds-label">
                {label}
            </label>
            <div className="oph-ds-input-container">
                <input
                    ref={inputRef}
                    id={id}
                    name={id}
                    type={type ?? 'text'}
                    value={value}
                    onChange={(e) => (debounceTimeout ? setValue(e.target.value) : onChange(e.target.value))}
                    className={`oph-ds-input ${iconClass} ${clearButtonClass} ${error !== undefined ? 'oph-ds-input-error' : ''}`}
                    disabled={disabled}
                    autoComplete="false"
                    placeholder={placeholder}
                />
                {isClearable && (
                    <button
                        className={`oph-ds-input-clear-button ${icon ? 'oph-ds-input-clear-button-with-icon' : ''}`}
                        onClick={handleClear}
                        disabled={!value}
                        aria-disabled={!value}
                        style={value ? { cursor: 'pointer' } : { display: 'none' }}
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path
                                d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
                                fill="#1D1D1D"
                            />
                        </svg>
                        <span className="oph-ds-hidden-aria-label">{L('TYHJENNA')}</span>
                    </button>
                )}
            </div>
            {error && <span className="oph-ds-error">{error}</span>}
        </div>
    );
};
