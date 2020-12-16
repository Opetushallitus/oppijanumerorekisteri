import React from 'react';
import { connect } from 'react-redux';
import ConfirmButton from '../../button/ConfirmButton';
import { poistaKayttajatunnus } from '../../../../actions/henkilo.actions';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    disabled?: boolean;
};

type Props = OwnProps & {
    henkilo: HenkiloState;
    L: Localisations;
    poistaKayttajatunnus: (arg0: string) => void;
};

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

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect<Props, OwnProps>(mapStateToProps, {
    poistaKayttajatunnus,
})(PoistaKayttajatunnusButton);
