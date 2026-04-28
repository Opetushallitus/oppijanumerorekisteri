import React from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import { useLocalisations } from '../../../../selectors';
import { useGetHenkiloQuery, usePutYliajaTiedotVtjMutation } from '../../../../api/oppijanumerorekisteri';
import { add } from '../../../../slices/toastSlice';
import { useAppDispatch } from '../../../../store';

type OwnProps = {
    henkiloOid: string;
    disabled?: boolean;
    className?: string;
};

const VtjOverrideButton = ({ henkiloOid, disabled, className }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { data: henkilo } = useGetHenkiloQuery(henkiloOid);
    const { L } = useLocalisations();
    const [yliajaTiedotVtj] = usePutYliajaTiedotVtjMutation();
    return henkilo?.yksiloityVTJ && henkilo.hetu ? (
        <ConfirmButton
            key="vtjOverride"
            className={className}
            action={() =>
                yliajaTiedotVtj(henkilo.oidHenkilo)
                    .unwrap()
                    .catch(() =>
                        dispatch(
                            add({
                                id: `vtj-override-${henkiloOid}-${Math.random()}`,
                                type: 'error',
                                header: L('VTJ_OVERRIDE_ERROR_TOPIC'),
                                body: L('VTJ_OVERRIDE_ERROR_TEXT'),
                            })
                        )
                    )
            }
            normalLabel={L('VTJ_OVERRIDE_LINKKI')}
            confirmLabel={L('VTJ_OVERRIDE_LINKKI_CONFIRM')}
            disabled={disabled}
        />
    ) : null;
};

export default VtjOverrideButton;
