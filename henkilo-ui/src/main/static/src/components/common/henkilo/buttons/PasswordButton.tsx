import React from 'react';
import CSS from 'csstype';

import PopupButton from '../../button/PopupButton';
import PasswordPopupContent from '../../button/PasswordPopupContent';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    styles: CSS.Properties;
    disabled?: boolean;
    oidHenkilo: string;
};

const PasswordButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <PopupButton
            popupClass="oph-popup-default oph-popup-bottom oph-popup-password"
            disabled={props.disabled}
            popupButtonWrapperPositioning="relative"
            popupStyle={props.styles}
            popupTitle={
                <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                    {L('SALASANA_ASETA')}
                </span>
            }
            popupContent={<PasswordPopupContent oidHenkilo={props.oidHenkilo} />}
        >
            {L('SALASANA_ASETA')}
        </PopupButton>
    );
};

export default PasswordButton;
