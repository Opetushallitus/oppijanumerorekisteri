import React from 'react';

import ConfirmButton from '../../button/ConfirmButton';
import Button from '../../button/Button';
import { usePassivoiHenkiloMutation } from '../../../../api/oppijanumerorekisteri';
import { useLocalisations } from '../../../../selectors';
import { add } from '../../../../slices/toastSlice';
import { useAppDispatch } from '../../../../store';

type OwnProps = {
    henkiloOid: string;
    passivoitu: boolean;
    disabled?: boolean;
    className?: string;
};

const PassivoiButton = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const [passivoiHenkilo] = usePassivoiHenkiloMutation();

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
                        dispatch(
                            add({
                                id: `passivoi-${props.henkiloOid}-${Math.random()}`,
                                type: 'error',
                                header: L('PASSIVOI_ERROR_TOPIC'),
                                body: L('PASSIVOI_ERROR_TEXT'),
                            })
                        )
                    )
            }
            normalLabel={L('PASSIVOI_LINKKI')}
            confirmLabel={L('PASSIVOI_LINKKI_CONFIRM')}
            disabled={!!props.disabled}
        />
    );
};

export default PassivoiButton;
