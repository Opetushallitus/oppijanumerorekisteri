import * as React from 'react';
import classNames from 'classnames';

type OphModalProps = {
    children: React.ReactNode;
    title?: string;
    onClose: (arg0: React.SyntheticEvent) => void;
    big?: boolean;
    onOverlayClick?: (arg0: React.SyntheticEvent) => void;
};

/**
 * Tyylioppaan mukainen modal.
 */
const OphModal = ({ big, children, onClose, onOverlayClick, title }: OphModalProps) => {
    return (
        <div
            className="oph-overlay oph-overlay-bg oph-overlay-is-visible"
            role="dialog"
            tabIndex={-1}
            onClick={(e) => (onOverlayClick ? onOverlayClick(e) : onClose(e))}
        >
            <div
                className={classNames('oph-modal', { 'oph-modal-big': big })}
                role="document"
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
                    {title && <h1 className="oph-modal-title">{title}</h1>}
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
