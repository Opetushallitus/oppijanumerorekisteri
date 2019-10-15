// @flow
import React from 'react';
import type {Node} from 'react';
import './PopupButton.css';
import onClickOutside from "react-onclickoutside";

type Props = {
    popupTitle?: any, // Title/header for the popup
    popupContent: Node, // React element as popup content
    children: any, // Button text

    toggle?: boolean,
    popupClass?: string, // css-classes for popup (see oph style guide)
    popupStyle?: any, // css-styles for positioning popup
    disabled?: boolean,
    simple?: boolean,
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
class PopupButton extends React.Component<Props, State> {

    state = {
        show: false,
        defaultPopupClass: 'oph-popup-default oph-popup-bottom'
    };

    componentWillReceiveProps(nextProps: Props) {
        if(nextProps.toggle !== undefined) {
            this.setState({show: nextProps.toggle});
        }
    }

    render(): Node {
        const wrapperStyle = this.props.popupButtonWrapperPositioning ? {position: this.props.popupButtonWrapperPositioning} : {};
        const popupButtonClasses = this.props.popupButtonClasses ? this.props.popupButtonClasses : 'oph-button oph-button-primary';
        return (
            <div style={wrapperStyle} className="popup-button">
                <button onClick={this.show.bind(this)}
                        className={popupButtonClasses}
                        type="button"
                        disabled={this.props.disabled}>{this.props.children}</button>
                { this.state.show ? (this.props.simple ? this.createSimplePopup() : this.createPopup()) : null}
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

    createSimplePopup() {
        const popupClass: string = this.props.popupClass ? this.props.popupClass : this.state.defaultPopupClass;
        const contentStyle = {
            marginTop: 0
        };

        return (
            <div className={`oph-popup ${popupClass} popup-paddings`} style={this.props.popupStyle}>
                <div className="oph-popup-arrow" style={this.props.popupArrowStyles}></div>
                <div className="oph-popup-content" style={contentStyle}>{this.props.popupContent}</div>
            </div>
        )
    }

    closePopup(): void {
        this.setState({show: false});
    }

    show(): void {
        this.setState({show: true});
    }

    handleClickOutside = (event: any) => {
        this.setState({show: false});
    };
}

export default onClickOutside(PopupButton);

