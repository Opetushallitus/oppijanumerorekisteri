import React, { ReactNode } from 'react';
import type CSS from 'csstype';

type Props = {
    show: boolean;
    onClose: (e: React.SyntheticEvent<EventTarget>) => void;
    closeOnOuterClick: boolean;
    children: ReactNode;
};

const wrapperStyles: Partial<CSS.Properties> = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    zIndex: 99999,
    pointerEvents: 'auto',
    overflowY: 'auto',
};

export default class Modal extends React.Component<Props> {
    render() {
        if (this.props.show) {
            return (
                <div
                    className="modal"
                    style={wrapperStyles}
                    onClick={this.hideOnOuterClick.bind(this)}
                    data-modal="true"
                >
                    {this.props.children}
                </div>
            );
        } else {
            return null;
        }
    }

    hideOnOuterClick(e: React.SyntheticEvent<EventTarget>) {
        if (e.target instanceof HTMLElement && e.target.dataset.modal && this.props.closeOnOuterClick) {
            this.props.onClose(e);
        }
    }
}
