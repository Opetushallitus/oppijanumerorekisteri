// @flow
import React from 'react';
import {connect} from 'react-redux';
import ConfirmButton from "../../button/ConfirmButton";
import Button from "../../button/Button";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import {passivoiHenkilo} from "../../../../actions/henkilo.actions";
import type {Localisations} from "../../../../types/localisation.type";

type OwnProps = {
    disabled?: boolean
}

type Props = {
    ...OwnProps,
    henkilo: HenkiloState,
    L: Localisations,
    passivoiHenkilo: (string) => void,
}

const PassivoiButton = (props: Props) => props.henkilo.henkilo.passivoitu
    ? <Button key="passivoi"
              disabled={!!props.henkilo.henkilo.passivoitu}
              action={(e: SyntheticEvent<HTMLButtonElement>) => {}}>{props.L['PASSIVOI_PASSIVOITU']}</Button>
    : <ConfirmButton key="passivoi"
                     action={() => props.passivoiHenkilo(props.henkilo.henkilo.oidHenkilo)}
                     normalLabel={props.L['PASSIVOI_LINKKI']}
                     confirmLabel={props.L['PASSIVOI_LINKKI_CONFIRM']}
                     id="passivoi"
                    disabled={!!props.disabled}/>;

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {passivoiHenkilo})(PassivoiButton);
