import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import PopupButton from '../../button/PopupButton';
import HakatunnistePopupContent from '../../button/HakaPopupContent';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    oidHenkilo: string;
    styles: any;
    disabled?: boolean;
};

type StateProps = {
    L: Localisations;
};
type Props = OwnProps & StateProps;

const HakaButton = (props: Props) => (
    <PopupButton
        popupStyle={props.styles}
        popupTitle={
            <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                {props.L['HAKATUNNISTEET']}:
            </span>
        }
        popupClass={'oph-popup-default oph-popup-bottom'}
        disabled={props.disabled}
        popupButtonWrapperPositioning={'relative'}
        popupContent={<HakatunnistePopupContent henkiloOid={props.oidHenkilo} L={props.L} />}
    >
        {props.L['LISAA_HAKA_LINKKI']}
    </PopupButton>
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, {}, OwnProps, RootState>(mapStateToProps, {})(HakaButton);
