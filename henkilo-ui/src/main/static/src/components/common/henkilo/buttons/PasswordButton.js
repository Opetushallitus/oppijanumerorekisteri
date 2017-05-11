import React from 'react'
import PopupButton from "../../button/PopupButton";
import PasswordPopupContent from "../../button/PasswordPopupContent";

const PasswordButton = ({L, oidHenkilo, updatePassword}) =>
    <PopupButton popupClass={'oph-popup-default oph-popup-top oph-popup-password'}
             popupStyle={{ bottom: '-5px', left: '795px', width: '18rem' }}
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
