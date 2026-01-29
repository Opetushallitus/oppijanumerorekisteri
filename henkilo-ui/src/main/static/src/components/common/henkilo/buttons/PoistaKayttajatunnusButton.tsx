import React from 'react';
import { useNavigate } from 'react-router';

import ConfirmButton from '../../button/ConfirmButton';
import { useLocalisations } from '../../../../selectors';
import { useDeleteAccessMutation } from '../../../../api/oppijanumerorekisteri';

type OwnProps = {
    henkiloOid: string;
    disabled?: boolean;
    className?: string;
};

const PoistaKayttajatunnusButton = ({ henkiloOid, disabled, className }: OwnProps) => {
    const navigate = useNavigate();
    const { L } = useLocalisations();
    const [deleteAccess] = useDeleteAccessMutation();

    const poistaKayttajatunnus = async () => {
        const r = window.confirm(L['POISTAKAYTTAJATUNNUS_CONFIRM_TEKSTI']);
        if (r) {
            await deleteAccess(henkiloOid)
                .unwrap()
                .then(() => navigate('/virkailijahaku'));
        }
    };

    return (
        <ConfirmButton
            key="poistaKayttajatunnus"
            className={className}
            action={() => poistaKayttajatunnus()}
            normalLabel={L['POISTAKAYTTAJATUNNUS_LINKKI']}
            confirmLabel={L['POISTAKAYTTAJATUNNUS_LINKKI_CONFIRM']}
            disabled={!!disabled}
        />
    );
};

export default PoistaKayttajatunnusButton;
