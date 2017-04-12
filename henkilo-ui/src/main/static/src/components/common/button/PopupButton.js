import React from 'react'

export default class PopupButton extends React.Component {

    static propTypes = {
        popupStyle: React.PropTypes.object,
        popupTitle: React.PropTypes.element,
        popupContent: React.PropTypes.element,
    };

    constructor(props) {
        super(props);
        this.state = {
            show: false,
        };

    }

    render() {
        // const popupProps = {...this.props};
        const wrapperStyle = { position: 'relative' };
        return (
            <div style={wrapperStyle}>
                <button onClick={this.show.bind(this)} className="oph-button oph-button-primary oph-button-big"  type="button">{this.props.children}</button>
                { this.state.show ? this.createPopup() : null }
            </div>
        );
    };



    createPopup() {
        const closeButtonStyles = {
            float: 'right',
            clear: 'right',
            cursor: 'pointer'
        };

        return (
            <div className="oph-popup oph-popup-default oph-popup-top" style={this.props.popupStyle}>
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

