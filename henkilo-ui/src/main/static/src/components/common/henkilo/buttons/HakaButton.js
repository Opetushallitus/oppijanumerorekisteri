// @flow
import React from 'react';
import {connect} from 'react-redux';
import PopupButton from "../../button/PopupButton";
import HakatunnistePopupContent from "../../button/HakaPopupContent";
import type {Localisations} from "../../../../types/localisation.type";

type OwnProps = {
    oidHenkilo: string,
    styles: any,
    disabled?: boolean
}

type Props = {
    ...OwnProps,
    L: Localisations,
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

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {})(HakaButton);
