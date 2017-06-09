import React from 'react'
import {connect} from 'react-redux';
import PopupButton from "../../button/PopupButton";
import PasswordPopupContent from "../../button/PasswordPopupContent";
import {updatePassword} from "../../../../actions/henkilo.actions";
import {removeNotification} from "../../../../actions/notifications.actions";

class PasswordButton extends React.Component {

    render() {
        const props = {...this.props};

        return <PopupButton popupClass={'oph-popup-default oph-popup-bottom oph-popup-password'}
            popupStyle={props.styles}
            popupTitle={<h3 style={{textAlign: 'left'}}>{props.L['SALASANA_ASETA']}</h3>}
            popupContent={<PasswordPopupContent {...props}/>}>
                {props.L['SALASANA_ASETA']}
        </PopupButton>;
    }

}

PasswordButton.propTypes = {
    L: React.PropTypes.object,
    styles: React.PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        notifications: state.notifications,
        updatePassword,
    };
};

export default connect(mapStateToProps, {updatePassword, removeNotification})(PasswordButton);