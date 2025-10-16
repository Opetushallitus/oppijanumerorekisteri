import React from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import { usePuraYksilointiMutation } from '../../../../api/oppijanumerorekisteri';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    henkiloOid: string;
    disabled?: boolean;
};

const PuraHetuttomanYksilointiButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const [puraYksilointi] = usePuraYksilointiMutation();
    return (
        <ConfirmButton
            key="purayksilointi"
            action={() => puraYksilointi(props.henkiloOid)}
            normalLabel={L['PURA_YKSILOINTI_LINKKI']}
            confirmLabel={L['PURA_YKSILOINTI_LINKKI_CONFIRM']}
            disabled={props.disabled}
        />
    );
};

export default PuraHetuttomanYksilointiButton;
