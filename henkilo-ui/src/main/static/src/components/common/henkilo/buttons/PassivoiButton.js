// @flow
import React from 'react'
import ConfirmButton from "../../button/ConfirmButton";
import Button from "../../button/Button";
import type {HenkiloState} from "../../../../reducers/henkilo.reducer";

type Props = {
    henkilo: HenkiloState,
    L: any,
    passivoiAction: (string) => any,
    disabled?: boolean
}

const PassivoiButton = (props: Props) => props.henkilo.henkilo.passivoitu
    ? <Button key="passivoi" disabled={props.disabled} action={() => {}}>{props.L['PASSIVOI_PASSIVOITU']}</Button>
    : <ConfirmButton key="passivoi"
                     action={() => props.passivoiAction(props.henkilo.henkilo.oidHenkilo)}
                     normalLabel={props.L['PASSIVOI_LINKKI']}
                     confirmLabel={props.L['PASSIVOI_LINKKI_CONFIRM']}
                     id="passivoi"
                    disabled={props.disabled}/>;

export default PassivoiButton;