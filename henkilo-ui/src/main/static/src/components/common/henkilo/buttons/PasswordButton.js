import React from 'react'
import PopupButton from "../../button/PopupButton";
import PasswordPopupContent from "../../button/PasswordPopupContent";

const PasswordButton = ({L, oidHenkilo, updatePassword, styles}) =>
    <PopupButton popupClass={'oph-popup-default oph-popup-bottom oph-popup-password'}
             popupStyle={styles}
             popupTitle={<h3 style={{textAlign: 'left'}}>{L['SALASANA_ASETA']}</h3>}
             popupContent={<PasswordPopupContent henkiloOid={oidHenkilo}
                                                 L={L}
                                                 updatePassword={updatePassword}/>}>
        {L['SALASANA_ASETA']}
    </PopupButton>;

PasswordButton.propTypes = {
    L: React.PropTypes.object,
    oidHenkilo: React.PropTypes.string,
    updatePassword: React.PropTypes.func,
};

export default PasswordButton;