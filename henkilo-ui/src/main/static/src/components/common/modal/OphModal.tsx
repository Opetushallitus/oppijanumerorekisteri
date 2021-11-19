import * as React from 'react';
import classNames from 'classnames';

type OphModalProps = {
    children: React.ReactNode;
    title?: string;
    onClose: (arg0: React.SyntheticEvent<HTMLButtonElement>) => void;
    big?: boolean;
    onOverlayClick?: (arg0: React.SyntheticEvent) => void;
};

/**
 * Tyylioppaan mukainen modal.
 */
class OphModal extends React.Component<OphModalProps> {
    render() {
        return (
            <div
                className="oph-overlay oph-overlay-bg oph-overlay-is-visible"
                role="dialog"
                tabIndex={-1}
                onClick={(e) => this.props.onOverlayClick && this.props.onOverlayClick(e)}
            >
                <div className={classNames({ 'oph-modal': true }, { 'oph-modal-big': this.props.big })} role="document">
                    <button
                        className="oph-button oph-button-close"
                        type="button"
                        title="Close"
                        aria-label="Close"
                        onClick={this.props.onClose}
                    >
                        <span aria-hidden="true">×</span>
                    </button>

                    <div className="oph-modal-content">
                        {this.props.title && <h1 className="oph-modal-title">{this.props.title}</h1>}
                        {this.props.children}
                    </div>

                    <a className="oph-link oph-modal-back-to-top-link" href="#modal">
                        Back to modal top
                    </a>
                </div>
            </div>
        );
    }
}

export default OphModal;
