import React from 'react'
import PropTypes from 'prop-types'
import PopupButton from "../../button/PopupButton";
import HakatunnistePopupContent from "../../button/HakaPopupContent";

const HakaButton = ({L, oidHenkilo, styles}) =>
    <PopupButton popupStyle={styles}
                 popupTitle={<h3 style={{textAlign: 'left'}}>{L['HAKATUNNISTEET']}:</h3>}
                 popupClass={'oph-popup-default oph-popup-bottom'}
                 popupContent={<HakatunnistePopupContent henkiloOid={oidHenkilo}
                                                         L={L} />}>
        {L['LISAA_HAKA_LINKKI']}
    </PopupButton>;

HakaButton.propTypes = {
    L: PropTypes.object,
    oidHenkilo: PropTypes.string,
    styles: PropTypes.object
};

export default HakaButton;
