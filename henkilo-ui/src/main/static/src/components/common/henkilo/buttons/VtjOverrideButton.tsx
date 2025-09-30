import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { useLocalisations } from '../../../../selectors';
import { usePutYliajaTiedotVtjMutation } from '../../../../api/oppijanumerorekisteri';
import { ButtonNotification } from '../../button/NotificationButton';

type OwnProps = {
    disabled?: boolean;
};

const VtjOverrideButton = ({ disabled }: OwnProps) => {
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { L } = useLocalisations();
    const [notification, setNotification] = useState<ButtonNotification>();
    const [yliajaTiedotVtj] = usePutYliajaTiedotVtjMutation();
    return henkilo.henkilo.yksiloityVTJ && henkilo.henkilo.hetu ? (
        <ConfirmButton
            key="vtjOverride"
            action={() =>
                yliajaTiedotVtj(henkilo.henkilo.oidHenkilo)
                    .unwrap()
                    .catch(() =>
                        setNotification({
                            notL10nMessage: 'VTJ_OVERRIDE_ERROR_TOPIC',
                            notL10nText: 'VTJ_OVERRIDE_ERROR_TEXT',
                        })
                    )
            }
            normalLabel={L['VTJ_OVERRIDE_LINKKI']}
            confirmLabel={L['VTJ_OVERRIDE_LINKKI_CONFIRM']}
            disabled={disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    ) : null;
};

export default VtjOverrideButton;
