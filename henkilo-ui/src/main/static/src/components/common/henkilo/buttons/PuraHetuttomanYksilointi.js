// @flow
import React from 'react';
import {connect} from 'react-redux';
import ConfirmButton from "../../button/ConfirmButton";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {Localisations} from "../../../../types/localisation.type";
import {puraYksilointi} from "../../../../actions/henkilo.actions";

type Props = {
    henkilo: HenkiloState,
    L: Localisations,
    puraYksilointi: (string) => void,
    disabled?: boolean
}

const PuraHetuttomanYksilointiButton = (props: Props) =>
    !props.henkilo.henkilo.yksiloityVTJ && !props.henkilo.henkilo.hetu && props.henkilo.henkilo.yksiloity ?
        <ConfirmButton key="purayksilointi"
                       action={() => props.puraYksilointi(props.henkilo.henkilo.oidHenkilo)}
                       normalLabel={props.L['PURA_YKSILOINTI_LINKKI']}
                       confirmLabel={props.L['PURA_YKSILOINTI_LINKKI_CONFIRM']}
                       id="purayksilointi"
                        disabled={props.disabled}/>
        : null;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {puraYksilointi})(PuraHetuttomanYksilointiButton);
