import React from 'react';
import TextButton from '../../common/button/TextButton';
import './DuplikaatitApplicationsPopup.css'

export default class DuplikaatitApplicationsPopup extends React.Component {

    static propTypes = {
        popupContent: React.PropTypes.element
    };

    constructor(props) {
        super(props);
        this.state = {
            show: false
        };
    }

    render() {
        const wrapperStyle = { position: 'relative' };
        return (
            <div style={wrapperStyle} >
                <TextButton action={this.show.bind(this)}>
                    {this.props.children}
                </TextButton>
                { this.state.show ? this.createPopup() : null }
            </div>
        )
    }

    createPopup() {
        const closeButtonStyles = {
            float: 'right',
            clear: 'right',
            cursor: 'pointer',
            marginTop: '-5px'
        };

        return <div className={`oph-popup oph-popup-default oph-popup-right other-applications`} >
            <div className="oph-popup-arrow"></div>
            <div style={closeButtonStyles}><i className="fa fa-times" onClick={() => this.closePopup()}></i></div>
            <div className="oph-popup-content">{this.props.popupContent}</div>
        </div>
    }

    closePopup() {
        this.setState({show: false});
    }

    show() {
        this.setState({show: true});
    }

}

