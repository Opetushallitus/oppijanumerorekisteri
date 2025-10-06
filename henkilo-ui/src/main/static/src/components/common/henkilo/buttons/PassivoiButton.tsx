import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import Button from '../../button/Button';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { usePassivoiHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { ButtonNotification } from '../../button/NotificationButton';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    disabled?: boolean;
};

const PassivoiButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const { henkilo } = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const [passivoiHenkilo] = usePassivoiHenkiloMutation();
    const [notification, setNotification] = useState<ButtonNotification>();
    return henkilo.passivoitu ? (
        <Button key="passivoi" disabled={!!henkilo.passivoitu}>
            {L['PASSIVOI_PASSIVOITU']}
        </Button>
    ) : (
        <ConfirmButton
            key="passivoi"
            action={() =>
                passivoiHenkilo(henkilo.oidHenkilo)
                    .unwrap()
                    .catch(() =>
                        setNotification({
                            notL10nMessage: 'PASSIVOI_ERROR_TOPIC',
                            notL10nText: 'PASSIVOI_ERROR_TEXT',
                        })
                    )
            }
            normalLabel={L['PASSIVOI_LINKKI']}
            confirmLabel={L['PASSIVOI_LINKKI_CONFIRM']}
            disabled={!!props.disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    );
};

export default PassivoiButton;
