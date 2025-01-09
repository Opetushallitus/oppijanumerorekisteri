import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { poistaKayttajatunnus } from '../../../../actions/henkilo.actions';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    disabled?: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    L: Localisations;
};

type DispatchProps = {
    poistaKayttajatunnus: (oid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

const PoistaKayttajatunnusButton = (props: Props) => (
    <ConfirmButton
        key="poistaKayttajatunnus"
        action={() => {
            const r = window.confirm(props.L['POISTAKAYTTAJATUNNUS_CONFIRM_TEKSTI']);
            if (r) props.poistaKayttajatunnus(props.henkilo.henkilo.oidHenkilo);
        }}
        normalLabel={props.L['POISTAKAYTTAJATUNNUS_LINKKI']}
        confirmLabel={props.L['POISTAKAYTTAJATUNNUS_LINKKI_CONFIRM']}
        id="poistaKayttajatunnus"
        disabled={!!props.disabled}
    />
);

const mapStateToProps = (state: RootState): StateProps => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    poistaKayttajatunnus,
})(PoistaKayttajatunnusButton);
