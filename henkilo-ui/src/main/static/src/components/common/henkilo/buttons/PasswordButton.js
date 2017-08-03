import React from 'react'
import PropTypes from 'prop-types'
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
                            popupTitle={<span className="oph-h3 oph-strong" style={{textAlign: 'left'}}>{props.L['SALASANA_ASETA']}</span>}
            popupContent={<PasswordPopupContent {...props}/>}>
                {props.L['SALASANA_ASETA']}
        </PopupButton>;
    }

}

PasswordButton.propTypes = {
    L: PropTypes.object,
    styles: PropTypes.object,
};

const mapStateToProps = (state) => {
    return {
        notifications: state.notifications,
        updatePassword,
    };
};

export default connect(mapStateToProps, {updatePassword, removeNotification})(PasswordButton);