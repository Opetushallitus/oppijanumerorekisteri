import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { usePuraYksilointiMutation } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    disabled?: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    L: Localisations;
};

type Props = OwnProps & StateProps;

const PuraHetuttomanYksilointiButton = (props: Props) => {
    const [puraYksilointi] = usePuraYksilointiMutation();
    if (props.henkilo.henkilo.yksiloityVTJ || (props.henkilo.henkilo.hetu && props.henkilo.henkilo.yksiloity)) {
        return null;
    }

    return (
        <ConfirmButton
            key="purayksilointi"
            action={() => puraYksilointi(props.henkilo.henkilo.oidHenkilo)}
            normalLabel={props.L['PURA_YKSILOINTI_LINKKI']}
            confirmLabel={props.L['PURA_YKSILOINTI_LINKKI_CONFIRM']}
            id="purayksilointi"
            disabled={props.disabled}
        />
    );
};

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, null, OwnProps, RootState>(mapStateToProps)(PuraHetuttomanYksilointiButton);
