import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../../../store';
import ConfirmButton from '../../button/ConfirmButton';
import { HenkiloState } from '../../../../reducers/henkilo.reducer';
import { useYksiloiHetutonMutation } from '../../../../api/oppijanumerorekisteri';
import { isHenkiloValidForYksilointi } from '../../../../validation/YksilointiValidator';
import { ButtonNotification } from '../../button/NotificationButton';
import { useLocalisations } from '../../../../selectors';

type OwnProps = {
    disabled?: boolean;
};

const YksiloiHetutonButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const { henkilo } = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const [yksiloiHetuton] = useYksiloiHetutonMutation();
    const [notification, setNotification] = useState<ButtonNotification>();
    if (henkilo.yksiloityVTJ || henkilo.hetu || henkilo.yksiloity) {
        return null;
    }

    return (
        <ConfirmButton
            key="yksilointi"
            action={() =>
                isHenkiloValidForYksilointi(henkilo)
                    ? yksiloiHetuton(henkilo.oidHenkilo)
                          .unwrap()
                          .catch(() =>
                              setNotification({
                                  notL10nMessage: 'YKSILOI_ERROR_TOPIC',
                                  notL10nText: 'YKSILOI_ERROR_TEXT',
                              })
                          )
                    : setNotification({
                          notL10nMessage: 'YKSILOI_PUUTTUVAT_TIEDOT_TOPIC',
                          notL10nText: 'YKSILOI_PUUTTUVAT_TIEDOT_TEXT',
                      })
            }
            normalLabel={L['YKSILOI_LINKKI']}
            confirmLabel={L['YKSILOI_LINKKI_CONFIRM']}
            disabled={props.disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    );
};

export default YksiloiHetutonButton;
