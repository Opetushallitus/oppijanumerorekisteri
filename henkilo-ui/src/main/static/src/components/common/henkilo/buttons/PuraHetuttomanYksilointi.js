// @flow
import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    L: any,
    puraYksilointiAction: (string) => any,
    disabled?: boolean
}

const PuraHetuttomanYksilointiButton = (props: Props) =>
    !props.henkilo.henkilo.yksiloityVTJ && !props.henkilo.henkilo.hetu && props.henkilo.henkilo.yksiloity ?
        <ConfirmButton key="purayksilointi"
                       action={() => props.puraYksilointiAction(props.henkilo.henkilo.oidHenkilo)}
                       normalLabel={props.L['PURA_YKSILOINTI_LINKKI']}
                       confirmLabel={props.L['PURA_YKSILOINTI_LINKKI_CONFIRM']}
                       id="purayksilointi"
                        disabled={props.disabled}/>
        : null;

export default PuraHetuttomanYksilointiButton;