import React from 'react';
import CSS from 'csstype';

import PopupButton from '../../button/PopupButton';
import HakatunnistePopupContent from '../../button/HakaPopupContent';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    oidHenkilo: string;
    styles: CSS.Properties;
    disabled?: boolean;
};

const HakaButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <PopupButton
            popupStyle={props.styles}
            popupTitle={
                <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                    {L('HAKATUNNISTEET')}:
                </span>
            }
            popupClass="oph-popup-default oph-popup-bottom"
            disabled={props.disabled}
            popupButtonWrapperPositioning="relative"
            popupContent={<HakatunnistePopupContent henkiloOid={props.oidHenkilo} />}
        >
            {L('LISAA_HAKA_LINKKI')}
        </PopupButton>
    );
};

export default HakaButton;
