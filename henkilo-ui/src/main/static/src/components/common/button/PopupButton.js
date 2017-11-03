// @flow
import React from 'react'
import './PopupButton.css';

type Props = {
    popupStyle: any,
    closeButtonStyles?: any,
    popupTitle: any,
    popupContent: any,
    popupClass?: string,
    disabled?: boolean,
    children: any
}

type State = {
    show: boolean,
    defaultPopupClass: string
}


export default class PopupButton extends React.Component<Props, State> {

    state = {
        show: false,
        defaultPopupClass: 'oph-popup-default oph-popup-top'
    };

    render() {
        const wrapperStyle = { position: 'relative' };
        return (
            <div style={wrapperStyle}>
                <button onClick={this.show.bind(this)}
                        className="oph-button oph-button-primary"
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

        const popupClass = this.props.popupClass ? this.props.popupClass : this.state.defaultPopupClass;

        return (
            <div className={`oph-popup ${popupClass} popup-paddings`} style={this.props.popupStyle}>
                <div className="oph-popup-arrow"></div>
                <div style={closeButtonStyles}><i className="fa fa-times" onClick={() => this.closePopup()}></i></div>
                <div className="oph-popup-title">{this.props.popupTitle} </div>
                <div className="oph-popup-content">{this.props.popupContent}</div>
            </div>
        )
    }

    closePopup() {
        this.setState({show: false});
    }

    show() {
        this.setState({show: true});
    }
}

