import React from 'react'
import './PopupButton.css';

export default class PopupButton extends React.Component {

    static propTypes = {
        popupStyle: React.PropTypes.object,
        popupTitle: React.PropTypes.element,
        popupContent: React.PropTypes.element,
        popupClass: React.PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            show: false,
        };

    }

    render() {
        const wrapperStyle = { position: 'relative' };
        return (
            <div style={wrapperStyle}>
                <button onClick={this.show.bind(this)}
                        className="oph-button oph-button-primary oph-button-big"
                        type="button">{this.props.children}</button>
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

        return (
            <div className={`oph-popup ${this.props.popupClass} popup-paddings`} style={this.props.popupStyle}>
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

PopupButton.defaultProps = {
    popupClass: 'oph-popup-default oph-popup-top'
};

