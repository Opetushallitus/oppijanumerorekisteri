// @flow
import React from 'react';
import type {Node} from 'react';
import './PopupButton.css';

type Props = {
    popupTitle: any, // Title/header for the popup
    popupContent: Node, // React element as popup content
    children: any, // Button text

    popupClass?: string, // css-classes for popup (see oph style guide)
    popupStyle?: any, // css-styles for positioning popup
    disabled?: boolean,
    popupButtonWrapperPositioning?: string, // value for css-position attribute (defaults to relative)
    popupArrowStyles?: any, // css-styles to position arrow
    popupButtonClasses?: string // css-classes for button (see oph style guide)
}

type State = {
    show: boolean,
    defaultPopupClass: string
}

/*
 * Component button with custom popup attached to it
 */
export default class PopupButton extends React.Component<Props, State> {

    state = {
        show: false,
        defaultPopupClass: 'oph-popup-default oph-popup-bottom'
    };

    render(): Node {
        const wrapperStyle = { position: this.props.popupButtonWrapperPositioning ? this.props.popupButtonWrapperPositioning : 'relative' };
        const popupButtonClasses = this.props.popupButtonClasses ? this.props.popupButtonClasses : 'oph-button oph-button-primary';
        return (
            <div style={wrapperStyle} className="popup-button">
                <button onClick={this.show.bind(this)}
                        className={popupButtonClasses}
                        type="button"
                        disabled={this.props.disabled}>{this.props.children}</button>
                { this.state.show ? this.createPopup() : null }
            </div>
        );
    };

    createPopup() {
        const closeButtonStyles = {
            float: 'right',
            clear: 'right',
            cursor: 'pointer',
            marginTop: '-20px',
            marginRight: '-20px'
        };

        const popupClass: string = this.props.popupClass ? this.props.popupClass : this.state.defaultPopupClass;

        return (
            <div className={`oph-popup ${popupClass} popup-paddings`} style={this.props.popupStyle}>
                <div className="oph-popup-arrow" style={this.props.popupArrowStyles}></div>
                <div style={closeButtonStyles}><i className="fa fa-times" onClick={() => this.closePopup()}></i></div>
                <div className="oph-popup-title">{this.props.popupTitle}</div>
                <div className="oph-popup-content">{this.props.popupContent}</div>
            </div>
        )
    }

    closePopup(): void {
        this.setState({show: false});
    }

    show(): void {
        this.setState({show: true});
    }
}

