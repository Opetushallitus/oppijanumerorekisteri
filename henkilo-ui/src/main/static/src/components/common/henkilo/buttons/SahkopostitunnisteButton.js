// @flow

import React from 'react';
import {connect} from "react-redux";
import type {Localisations} from "../../../../types/localisation.type";
import PopupButton from "../../button/PopupButton";
import SahkopostitunnistePopupContent from "../../button/SahkopostitunnistePopupContent";

type Props = {
    L: Localisations,
    oidHenkilo: string,
    styles: any,
    disabled?: boolean
}

const SahkopostitunnisteButton = (props: Props) => (
    <PopupButton popupStyle={props.styles}
                 popupTitle={<span className="oph-h3 oph-strong" style={{textAlign: 'left'}}>{props.L['SAHKOPOSTITUNNISTEET']}:</span>}
                 popupClass={'oph-popup-default oph-popup-bottom'}
                 disabled={props.disabled}
                 popupButtonWrapperPositioning={'relative'}
                 popupContent={<SahkopostitunnistePopupContent henkiloOid={props.oidHenkilo} L={props.L} />}>
        {props.L['HALLITSE_SAHKOPOSTITUNNISTEITA']}
    </PopupButton>);

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(SahkopostitunnisteButton);