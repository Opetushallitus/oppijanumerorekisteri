import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { usePuraYksilointiMutation } from '../../../../api/oppijanumerorekisteri';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    disabled?: boolean;
};

const PuraHetuttomanYksilointiButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const { henkilo } = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const [puraYksilointi] = usePuraYksilointiMutation();
    return (
        <ConfirmButton
            key="purayksilointi"
            action={() => puraYksilointi(henkilo.oidHenkilo)}
            normalLabel={L['PURA_YKSILOINTI_LINKKI']}
            confirmLabel={L['PURA_YKSILOINTI_LINKKI_CONFIRM']}
            disabled={props.disabled}
        />
    );
};

export default PuraHetuttomanYksilointiButton;
