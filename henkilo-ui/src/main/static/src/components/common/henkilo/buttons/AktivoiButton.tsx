import React from 'react';
import { Localisations } from '../../../../types/localisation.type';
import ConfirmButton from '../../button/ConfirmButton';
import { useAktivoiHenkiloMutation } from '../../../../api/oppijanumerorekisteri';

type Props = {
    L: Localisations;
    oidHenkilo: string;
};

const AktivoiButton = (props: Props) => {
    const [aktivoiHenkilo] = useAktivoiHenkiloMutation();
    return (
        <ConfirmButton
            key="aktivoi"
            action={() => aktivoiHenkilo(props)}
            normalLabel={props.L['AKTIVOI_LINKKI']}
            confirmLabel={props.L['AKTIVOI_LINKKI_CONFIRM']}
            id="aktivoi"
        />
    );
};

export default AktivoiButton;
