import React, { useState } from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import { useGetHenkiloQuery, useYksiloiHetutonMutation } from '../../../../api/oppijanumerorekisteri';
import { isHenkiloValidForYksilointi } from '../../../../validation/YksilointiValidator';
import { ButtonNotification } from '../../button/NotificationButton';
import { useLocalisations } from '../../../../selectors';
import { isVahvastiYksiloity } from '../../StaticUtils';

type OwnProps = {
    henkiloOid: string;
    disabled?: boolean;
    className?: string;
};

const YksiloiHetutonButton = (props: OwnProps) => {
    const { L } = useLocalisations();
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloOid);
    const [yksiloiHetuton] = useYksiloiHetutonMutation();
    const [notification, setNotification] = useState<ButtonNotification>();
    if (isVahvastiYksiloity(henkilo) || henkilo?.yksiloity || henkilo?.hetu) {
        return null;
    }

    return (
        <ConfirmButton
            key="yksilointi"
            className={props.className}
            action={() =>
                henkilo && isHenkiloValidForYksilointi(henkilo)
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
            normalLabel={L('YKSILOI_LINKKI')}
            confirmLabel={L('YKSILOI_LINKKI_CONFIRM')}
            disabled={props.disabled}
            notification={notification}
            removeNotification={() => setNotification(undefined)}
        />
    );
};

export default YksiloiHetutonButton;
