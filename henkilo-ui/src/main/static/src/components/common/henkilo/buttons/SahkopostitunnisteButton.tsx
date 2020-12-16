import React from 'react';
import { connect } from 'react-redux';
import { Localisations } from '../../../../types/localisation.type';
import PopupButton from '../../button/PopupButton';
import SahkopostitunnistePopupContent from '../../button/SahkopostitunnistePopupContent';

type OwnProps = {
    oidHenkilo: string;
    styles: any;
    disabled?: boolean;
};

type Props = OwnProps & {
    L: Localisations;
};

const SahkopostitunnisteButton = (props: Props) => (
    <PopupButton
        popupStyle={props.styles}
        popupTitle={
            <span className="oph-h3 oph-strong" style={{ textAlign: 'left' }}>
                {props.L['SAHKOPOSTITUNNISTEET']}:
            </span>
        }
        popupClass={'oph-popup-default oph-popup-bottom'}
        disabled={props.disabled}
        popupButtonWrapperPositioning={'relative'}
        popupContent={<SahkopostitunnistePopupContent henkiloOid={props.oidHenkilo} L={props.L} />}
    >
        {props.L['HALLITSE_SAHKOPOSTITUNNISTEITA']}
    </PopupButton>
);

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<Props, OwnProps>(mapStateToProps, {})(SahkopostitunnisteButton);
