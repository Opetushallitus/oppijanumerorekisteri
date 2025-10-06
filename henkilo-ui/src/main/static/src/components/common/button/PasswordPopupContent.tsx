import React, { useMemo, useState } from 'react';
import classNames from 'classnames';

import { isValidPassword } from '../../../validation/PasswordValidator';
import { useLocalisations } from '../../../selectors';
import { usePutPasswordMutation } from '../../../api/kayttooikeus';
import { useAppDispatch } from '../../../store';
import { add } from '../../../slices/toastSlice';

import './PasswordPopupContent.css';

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
                        header: L['NOTIFICATION_SALASANA_OK_TOPIC'],
                    })
                );
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `Password_update_${Math.random()}`,
                        type: 'error',
                        header: L['NOTIFICATION_SALASANA_ERROR_TOPIC'],
                    })
                );
            });
    }

    const passwordClass = classNames('oph-input haka-input', {
        'password-invalid': passwordValid === false,
    });

    const passwordConfirmedClass = classNames('oph-input haka-input', {
        'password-invalid': passwordConfirmedValid === false,
    });

    return (
        <div id="password-popup-form">
            <div className="password-controls">
                <label>{L['SALASANA_UUSI']}</label>
                <input
                    className={passwordClass}
                    type="password"
                    aria-required="true"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <div className="password-controls">
                <label>{L['SALASANA_VAHVISTA']}</label>
                <input
                    className={passwordConfirmedClass}
                    type="password"
                    aria-required="true"
                    value={passwordConfirmed}
                    onChange={(e) => setPasswordConfirmed(e.target.value)}
                />
            </div>
            <p>{L['SALASANA_SAANTO']}</p>
            <button
                className="oph-button oph-button-primary"
                disabled={!passwordValid || !passwordConfirmedValid}
                onClick={() => changePassword()}
            >
                {L['SALASANA_ASETA']}
            </button>
            <div className="clear" />
        </div>
    );
};

export default PasswordPopupContent;
