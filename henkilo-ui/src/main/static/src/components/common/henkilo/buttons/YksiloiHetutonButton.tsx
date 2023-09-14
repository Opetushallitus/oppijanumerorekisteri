import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { yksiloiHenkilo, yksiloiHenkiloPuuttuvatTiedot } from '../../../../actions/henkilo.actions';
import { Localisations } from '../../../../types/localisation.type';

type OwnProps = {
    disabled?: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    L: Localisations;
};

type DispatchProps = {
    yksiloiHenkiloPuuttuvatTiedot: () => void;
    yksiloiHenkilo: (oid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

const YksiloiHetutonButton = (props: Props) => {
    const henkilo = props.henkilo.henkilo;
    if (henkilo.yksiloityVTJ || henkilo.hetu || henkilo.yksiloity) {
        return null;
    }

    const isValidHenkilo =
        henkilo.etunimet &&
        henkilo.sukunimi &&
        henkilo.kutsumanimi &&
        henkilo.sukupuoli &&
        henkilo.syntymaaika &&
        henkilo.aidinkieli &&
        henkilo.kansalaisuus?.length;

    return (
        <ConfirmButton
            key="yksilointi"
            action={() =>
                isValidHenkilo ? props.yksiloiHenkilo(henkilo.oidHenkilo) : props.yksiloiHenkiloPuuttuvatTiedot()
            }
            normalLabel={props.L['YKSILOI_LINKKI']}
            confirmLabel={props.L['YKSILOI_LINKKI_CONFIRM']}
            disabled={props.disabled}
            id="yksilointi"
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    yksiloiHenkilo,
    yksiloiHenkiloPuuttuvatTiedot,
})(YksiloiHetutonButton);
