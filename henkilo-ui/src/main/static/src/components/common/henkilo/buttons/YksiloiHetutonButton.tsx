import React from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import { useGetHenkiloQuery, useYksiloiHetutonMutation } from '../../../../api/oppijanumerorekisteri';
import { isHenkiloValidForYksilointi } from '../../../../validation/YksilointiValidator';
import { useLocalisations } from '../../../../selectors';
import { isVahvastiYksiloity } from '../../StaticUtils';
import { add } from '../../../../slices/toastSlice';
import { useAppDispatch } from '../../../../store';

type OwnProps = {
    henkiloOid: string;
    disabled?: boolean;
    className?: string;
};

const YksiloiHetutonButton = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const { data: henkilo } = useGetHenkiloQuery(props.henkiloOid);
    const [yksiloiHetuton] = useYksiloiHetutonMutation();
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
                              dispatch(
                                  add({
                                      id: `yksiloi-${props.henkiloOid}-${Math.random()}`,
                                      type: 'error',
                                      header: L('YKSILOI_ERROR_TOPIC'),
                                      body: L('YKSILOI_ERROR_TEXT'),
                                  })
                              )
                          )
                    : dispatch(
                          add({
                              id: `yksiloi-puuttuvat-${props.henkiloOid}-${Math.random()}`,
                              type: 'error',
                              header: L('YKSILOI_PUUTTUVAT_TIEDOT_TOPIC'),
                              body: L('YKSILOI_PUUTTUVAT_TIEDOT_TEXT'),
                          })
                      )
            }
            normalLabel={L('YKSILOI_LINKKI')}
            confirmLabel={L('YKSILOI_LINKKI_CONFIRM')}
            disabled={props.disabled}
        />
    );
};

export default YksiloiHetutonButton;
