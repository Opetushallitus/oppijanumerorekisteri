import React from 'react'
import PopupButton from "../../button/PopupButton";
import HakatunnistePopupContent from "../../button/HakaPopupContent";

const HakaButton = ({L, oidHenkilo, styles}) =>
    <PopupButton popupStyle={styles}
                 popupTitle={<h4>{L['HAKATUNNISTEET']}:</h4>}
                 popupContent={<HakatunnistePopupContent henkiloOid={oidHenkilo}
                                                         L={L} />}>
        {L['LISAA_HAKA_LINKKI']}
    </PopupButton>;

HakaButton.propTypes = {
    L: React.PropTypes.object,
    oidHenkilo: React.PropTypes.string,
    styles: React.PropTypes.object
};

export default HakaButton;
