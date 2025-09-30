import React from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import { useLocalisations } from '../../../../selectors';
import { useDeleteAccessMutation } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid: string;
    disabled?: boolean;
};

const PoistaKayttajatunnusButton = ({ henkiloOid, disabled }: OwnProps) => {
    const { L } = useLocalisations();
    const [deleteAccess] = useDeleteAccessMutation();

    return (
        <ConfirmButton
            key="poistaKayttajatunnus"
            action={() => {
                const r = window.confirm(L['POISTAKAYTTAJATUNNUS_CONFIRM_TEKSTI']);
                if (r) deleteAccess(henkiloOid);
            }}
            normalLabel={L['POISTAKAYTTAJATUNNUS_LINKKI']}
            confirmLabel={L['POISTAKAYTTAJATUNNUS_LINKKI_CONFIRM']}
            disabled={!!disabled}
        />
    );
};

export default PoistaKayttajatunnusButton;
