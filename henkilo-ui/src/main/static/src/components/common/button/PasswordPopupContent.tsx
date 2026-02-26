import React, { useMemo, useState } from 'react';

import { isValidPassword } from '../../../validation/PasswordValidator';
import { useLocalisations } from '../../../selectors';
import { usePutPasswordMutation } from '../../../api/kayttooikeus';
import { useAppDispatch } from '../../../store';
import { add } from '../../../slices/toastSlice';
import { OphDsInput } from '../../design-system/OphDsInput';

import styles from './PasswordPopupContent.module.css';

type OwnProps = {
    oidHenkilo: string;
};

const PasswordPopupContent = ({ oidHenkilo }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const [password, setPassword] = useState('');
    const [passwordConfirmed, setPasswordConfirmed] = useState('');
    const [putPassword] = usePutPasswordMutation();

    const passwordValid = useMemo(() => {
        return isValidPassword(password);
    }, [password]);

    const passwordConfirmedValid = useMemo(() => {
        return password === passwordConfirmed;
    }, [password, passwordConfirmed]);

    async function changePassword() {
        await putPassword({ oid: oidHenkilo, password })
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `Password_update_${Math.random()}`,
                        type: 'ok',
                        header: L('NOTIFICATION_SALASANA_OK_TOPIC'),
                    })
                );
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `Password_update_${Math.random()}`,
                        type: 'error',
                        header: L('NOTIFICATION_SALASANA_ERROR_TOPIC'),
                    })
                );
            });
    }

    return (
        <div className={styles.passwordPopupContent}>
            <OphDsInput
                id="password"
                label={L('SALASANA_UUSI')}
                type="password"
                error={passwordValid ? undefined : L('SALASANA_EI_TAYTA_VAATIMUKSIA')}
                onChange={setPassword}
            />
            <OphDsInput
                id="passwordConfirmed"
                label={L('SALASANA_VAHVISTA')}
                type="password"
                error={passwordConfirmedValid ? undefined : L('SALASANA_EI_TASMAA')}
                onChange={setPasswordConfirmed}
            />
            <p>{L('SALASANA_SAANTO')}</p>
            <div>
                <button
                    className="oph-ds-button"
                    disabled={!passwordValid || !passwordConfirmedValid}
                    onClick={() => changePassword()}
                >
                    {L('SALASANA_ASETA')}
                </button>
            </div>
        </div>
    );
};

export default PasswordPopupContent;
