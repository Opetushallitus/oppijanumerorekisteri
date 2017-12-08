// @flow
import React from 'react';
import {connect} from 'react-redux';
import ConfirmButton from "../../button/ConfirmButton";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";
import type {L} from "../../../../types/localisation.type";
import {overrideHenkiloVtjData} from "../../../../actions/henkilo.actions";

type Props = {
    henkilo: HenkiloState,
    L: L,
    overrideHenkiloVtjData: (string) => void,
    disabled?: boolean
}

const VtjOverrideButton = (props: Props) =>{
    return props.henkilo.henkilo.yksiloityVTJ && props.henkilo.henkilo.hetu
        ? <ConfirmButton key="vtjOverride"
                         action={() => props.overrideHenkiloVtjData(props.henkilo.henkilo.oidHenkilo)}
                         normalLabel={props.L['VTJ_OVERRIDE_LINKKI']}
                         confirmLabel={props.L['VTJ_OVERRIDE_LINKKI_CONFIRM']}
                         id="vtjOverride"
                        disabled={props.disabled}/>
        : null;
};

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
    henkilo: state.henkilo,
});

export default connect(mapStateToProps, {overrideHenkiloVtjData})(VtjOverrideButton);
