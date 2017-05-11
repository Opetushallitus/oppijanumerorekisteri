import React from 'react'
import PopupButton from "../../button/PopupButton";
import HakatunnistePopupContent from "../../button/HakaPopupContent";

const HakaButton = ({L, oidHenkilo}) =>
    <PopupButton popupStyle={{ bottom: '10px', left: '515px'}}
                 popupTitle={<h3>{L['HAKATUNNISTEET']}:</h3>}
                 popupContent={<HakatunnistePopupContent henkiloOid={oidHenkilo}
                                                         L={L} />}>
        {L['LISAA_HAKA_LINKKI']}
    </PopupButton>;

HakaButton.propTypes = {
    L: React.PropTypes.object,
    oidHenkilo: React.PropTypes.string,
};

export default HakaButton;
