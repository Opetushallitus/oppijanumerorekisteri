// @flow
import React from 'react'
import {connect} from 'react-redux';
import PopupButton from "../../button/PopupButton";
import PasswordPopupContent from "../../button/PasswordPopupContent";
import {updatePassword} from "../../../../actions/henkilo.actions";
import {removeNotification} from "../../../../actions/notifications.actions";

type Props = {
    L: any,
    styles: any,
    disabled?: boolean
}

class PasswordButton extends React.Component<Props> {

    render() {
        const props = {...this.props};

        return <PopupButton popupClass={'oph-popup-default oph-popup-bottom oph-popup-password'}
            disabled={this.props.disabled}
            popupButtonWrapperPositioning={'relative'}
            popupStyle={props.styles}
            popupTitle={<span className="oph-h3 oph-strong" style={{textAlign: 'left'}}>{props.L['SALASANA_ASETA']}</span>}
            popupContent={<PasswordPopupContent {...props}/>}>
                {props.L['SALASANA_ASETA']}
        </PopupButton>;
    }

}

const mapStateToProps = (state) => {
    return {
        notifications: state.notifications,
        L: state.l10n.localisations[state.locale],
    };
};

export default connect(mapStateToProps, {updatePassword, removeNotification})(PasswordButton);