import * as React from 'react';
import { useId } from 'react';

type OphModalProps = {
    children: React.ReactNode;
    title?: string;
    onClose: (arg0: React.SyntheticEvent) => void;
    onOverlayClick?: (arg0: React.SyntheticEvent) => void;
};

/**
 * Tyylioppaan mukainen modal.
 */
const OphModal = ({ children, onClose, onOverlayClick, title }: OphModalProps) => {
    const labelId = useId();

    return (
        <div
            className="oph-overlay oph-overlay-bg oph-overlay-is-visible"
            role="presentation"
            tabIndex={-1}
            onClick={(e) => (onOverlayClick ? onOverlayClick(e) : onClose(e))}
        >
            <div
                className="oph-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={labelId}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            >
                <button
                    className="oph-button oph-button-close"
                    type="button"
                    title="Close"
                    aria-label="Close"
                    onClick={onClose}
                >
                    <span aria-hidden="true">×</span>
                </button>

                <div className="oph-modal-content">
                    {title && (
                        <h1 id={labelId} className="oph-modal-title">
                            {title}
                        </h1>
                    )}
                    {children}
                </div>

                <a className="oph-link oph-modal-back-to-top-link" href="#modal">
                    Back to modal top
                </a>
            </div>
        </div>
    );
};

export default OphModal;
