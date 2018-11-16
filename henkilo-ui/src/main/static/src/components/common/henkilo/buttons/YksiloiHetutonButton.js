// @flow
import React from 'react';
import {connect} from 'react-redux';
import ConfirmButton from "../../button/ConfirmButton";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import {yksiloiHenkilo} from "../../../../actions/henkilo.actions";
import type {Localisations} from "../../../../types/localisation.type";

type Props = {
    henkilo: HenkiloState,
    L: Localisations,
    yksiloiHenkilo: (string) => void,
    disabled?: boolean
}

const YksiloiHetutonButton = (props: Props) =>
    !props.henkilo.henkilo.yksiloityVTJ && !props.henkilo.henkilo.hetu && !props.henkilo.henkilo.yksiloity
        ? <ConfirmButton key="yksilointi"
                         action={() => props.yksiloiHenkilo(props.henkilo.henkilo.oidHenkilo)}
                         normalLabel={props.L['YKSILOI_LINKKI']}
                         confirmLabel={props.L['YKSILOI_LINKKI_CONFIRM']}
                         disabled={props.disabled}
                         id="yksilointi" />
        : null;

const mapStateToProps = state => ({
    henkilo: state.henkilo,
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {yksiloiHenkilo})(YksiloiHetutonButton);
