import React from 'react'
import PopupButton from "../../button/PopupButton";
import HakatunnistePopupContent from "../../button/HakaPopupContent";

const HakaButton = ({L, oidHenkilo, position}) =>
    <PopupButton popupStyle={position}
                 popupTitle={<h4>{L['HAKATUNNISTEET']}:</h4>}
                 popupContent={<HakatunnistePopupContent henkiloOid={oidHenkilo}
                                                         L={L} />}>
        {L['LISAA_HAKA_LINKKI']}
    </PopupButton>;

HakaButton.propTypes = {
    L: React.PropTypes.object,
    oidHenkilo: React.PropTypes.string,
    position: React.PropTypes.shape({ top: React.PropTypes.string,
        right: React.PropTypes.string, bottom: React.PropTypes.string, left: React.PropTypes.string })
};

export default HakaButton;
