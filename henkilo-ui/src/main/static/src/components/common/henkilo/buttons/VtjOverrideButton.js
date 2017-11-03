// @flow

import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    L: any,
    overrideAction: (string) => any,
    disabled?: boolean
}

const VtjOverrideButton = (props: Props) =>{
    return props.henkilo.henkilo.yksiloityVTJ && props.henkilo.henkilo.hetu
        ? <ConfirmButton key="vtjOverride"
                         action={() => props.overrideAction(props.henkilo.henkilo.oidHenkilo)}
                         normalLabel={props.L['VTJ_OVERRIDE_LINKKI']}
                         confirmLabel={props.L['VTJ_OVERRIDE_LINKKI_CONFIRM']}
                         id="vtjOverride"
                        disabled={props.disabled}/>
        : null;
};

export default VtjOverrideButton;
