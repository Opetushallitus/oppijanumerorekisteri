import React, { ReactNode } from 'react';

type Props = {
    children: ReactNode;
    dataTestid?: string;
    disabled?: boolean;
    isLoading?: boolean;
    onClick: (e?: React.SyntheticEvent<HTMLElement, Event>) => void;
};

export const OphDsButton = ({ children, dataTestid, disabled, isLoading, onClick }: Props) => {
    return (
        <button className="oph-ds-button" onClick={onClick} disabled={disabled || isLoading} data-testid={dataTestid}>
            {isLoading && (
                <svg className="oph-ds-spinner-in-button" viewBox="11 11 22 22" role="status" aria-label="Loading">
                    <circle
                        className="oph-ds-spinner-circle-in-button"
                        cx="22"
                        cy="22"
                        r="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.6"
                    />
                </svg>
            )}
            {children}
        </button>
    );
};
