import React from 'react';
import { Localisations } from '../../../../types/localisation.type';
import ConfirmButton from '../../button/ConfirmButton';
import { useAktivoiHenkiloMutation } from '../../../../api/oppijanumerorekisteri';

type Props = {
    L: Localisations;
    oidHenkilo: string;
};

const AktivoiButton = ({ L, oidHenkilo }: Props) => {
    const [aktivoiHenkilo] = useAktivoiHenkiloMutation();
    return (
        <ConfirmButton
            key="aktivoi"
            action={() => aktivoiHenkilo({ L, oidHenkilo })}
            normalLabel={L['AKTIVOI_LINKKI']}
            confirmLabel={L['AKTIVOI_LINKKI_CONFIRM']}
            id="aktivoi"
        />
    );
};

export default AktivoiButton;
