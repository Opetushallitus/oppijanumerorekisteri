import React from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import { useAktivoiHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { useLocalisations } from '../../../../selectors';

type Props = {
    oidHenkilo: string;
};

const AktivoiButton = ({ oidHenkilo }: Props) => {
    const { L } = useLocalisations();
    const [aktivoiHenkilo] = useAktivoiHenkiloMutation();
    return (
        <ConfirmButton
            key="aktivoi"
            action={() => aktivoiHenkilo({ L, oidHenkilo })}
            normalLabel={L['AKTIVOI_LINKKI']}
            confirmLabel={L['AKTIVOI_LINKKI_CONFIRM']}
        />
    );
};

export default AktivoiButton;
