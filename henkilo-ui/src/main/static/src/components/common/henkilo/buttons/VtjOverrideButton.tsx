import React, { useState } from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import { useLocalisations } from '../../../../selectors';
import { useGetHenkiloQuery, usePutYliajaTiedotVtjMutation } from '../../../../api/oppijanumerorekisteri';
import { ButtonNotification } from '../../button/NotificationButton';

type OwnProps = {
    henkiloOid: string;
    disabled?: boolean;
    className?: string;
};

const VtjOverrideButton = ({ henkiloOid, disabled, className }: OwnProps) => {
    const { data: henkilo } = useGetHenkiloQuery(henkiloOid);
    const { L } = useLocalisations();
    const [notification, setNotification] = useState<ButtonNotification>();
    const [yliajaTiedotVtj] = usePutYliajaTiedotVtjMutation();
    return henkilo?.yksiloityVTJ && henkilo.hetu ? (
        <ConfirmButton
            key="vtjOverride"
            className={className}
            action={() =>
                yliajaTiedotVtj(henkilo.oidHenkilo)
                    .unwrap()
                    .catch(() =>
                        setNotification({
                            notL10nMessage: 'VTJ_OVERRIDE_ERROR_TOPIC',
                            notL10nText: 'VTJ_OVERRIDE_ERROR_TEXT',
                        })
                    )
            }
            normalLabel={L('VTJ_OVERRIDE_LINKKI')}
            confirmLabel={L('VTJ_OVERRIDE_LINKKI_CONFIRM')}
            disabled={disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    ) : null;
};

export default VtjOverrideButton;
