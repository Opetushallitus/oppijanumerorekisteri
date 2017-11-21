// @flow
import React from 'react'
import PopupButton from "../../button/PopupButton";
import HakatunnistePopupContent from "../../button/HakaPopupContent";

type Props = {
    L: any,
    oidHenkilo: string,
    styles: any,
    disabled?: boolean
}

const HakaButton = (props: Props) => (
        <PopupButton popupStyle={props.styles}
               popupTitle={<span className="oph-h3 oph-strong" style={{textAlign: 'left'}}>{props.L['HAKATUNNISTEET']}:</span>}
               popupClass={'oph-popup-default oph-popup-bottom'}
               disabled={props.disabled}
               popupButtonWrapperPositioning={'relative'}
               popupContent={<HakatunnistePopupContent henkiloOid={props.oidHenkilo} L={props.L} />}>
            {props.L['LISAA_HAKA_LINKKI']}
        </PopupButton>);

export default HakaButton;
