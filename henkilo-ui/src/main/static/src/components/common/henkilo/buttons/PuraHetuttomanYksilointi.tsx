import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../../../reducers';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { Localisations } from '../../../../types/localisation.type';
import { puraYksilointi } from '../../../../actions/henkilo.actions';

type OwnProps = {
    disabled?: boolean;
};

type StateProps = {
    henkilo: HenkiloState;
    L: Localisations;
};

type DispatchProps = {
    puraYksilointi: (oid: string) => void;
};

type Props = OwnProps & StateProps & DispatchProps;

const PuraHetuttomanYksilointiButton = (props: Props) =>
    !props.henkilo.henkilo.yksiloityVTJ && !props.henkilo.henkilo.hetu && props.henkilo.henkilo.yksiloity ? (
        <ConfirmButton
            key="purayksilointi"
            action={() => props.puraYksilointi(props.henkilo.henkilo.oidHenkilo)}
            normalLabel={props.L['PURA_YKSILOINTI_LINKKI']}
            confirmLabel={props.L['PURA_YKSILOINTI_LINKKI_CONFIRM']}
            id="purayksilointi"
            disabled={props.disabled}
        />
    ) : null;

const mapStateToProps = (state: RootState): StateProps => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, {
    puraYksilointi,
})(PuraHetuttomanYksilointiButton);
