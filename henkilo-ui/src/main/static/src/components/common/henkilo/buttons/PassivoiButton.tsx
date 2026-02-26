import React, { useState } from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import Button from '../../button/Button';
import { usePassivoiHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { ButtonNotification } from '../../button/NotificationButton';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    henkiloOid: string;
    passivoitu: boolean;
    disabled?: boolean;
    className?: string;
};

const PassivoiButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const [passivoiHenkilo] = usePassivoiHenkiloMutation();
    const [notification, setNotification] = useState<ButtonNotification>();
    return props.passivoitu ? (
        <Button key="passivoi" disabled={!!props.passivoitu}>
            {L('PASSIVOI_PASSIVOITU')}
        </Button>
    ) : (
        <ConfirmButton
            key="passivoi"
            className={props.className}
            action={() =>
                passivoiHenkilo(props.henkiloOid)
                    .unwrap()
                    .catch(() =>
                        setNotification({
                            notL10nMessage: 'PASSIVOI_ERROR_TOPIC',
                            notL10nText: 'PASSIVOI_ERROR_TEXT',
                        })
                    )
            }
            normalLabel={L('PASSIVOI_LINKKI')}
            confirmLabel={L('PASSIVOI_LINKKI_CONFIRM')}
            disabled={!!props.disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    );
};

export default PassivoiButton;
