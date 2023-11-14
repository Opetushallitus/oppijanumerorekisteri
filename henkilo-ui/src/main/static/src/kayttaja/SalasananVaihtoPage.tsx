import React, { useState } from 'react';

import { useLocalisations } from '../selectors';
import Button from '../components/common/button/Button';
import { isValidPassword } from '../validation/PasswordValidator';
import { useGetCasLoginParamsQuery, usePostSalasananVaihtoMutation } from '../api/kayttooikeus';
import { addGlobalNotification } from '../actions/notification.actions';
import { useAppDispatch } from '../store';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import Loader from '../components/common/icons/Loader';

type Props = {
    params: {
        loginToken: string;
        locale: string;
    };
};

export const SalasananVaihtoPage = ({ params: { loginToken, locale } }: Props) => {
    const { l10n } = useLocalisations();
    const L = l10n.localisations[locale];
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [postPasswordChange, { isLoading }] = usePostSalasananVaihtoMutation();
    const { data, isLoading: isLoginParamsLoading } = useGetCasLoginParamsQuery();
    const dispatch = useAppDispatch();

    const submit = () => {
        postPasswordChange({ loginToken, newPassword, currentPassword })
            .unwrap()
            .then((loginParams) => {
                const redirectUrl = `/cas/login?${new URLSearchParams(loginParams)}`;
                window.location.replace(redirectUrl);
            })
            .catch(() =>
                dispatch(
                    addGlobalNotification({
                        key: 'PASSWORD_CHANGE_ERROR',
                        title: L['SALASANA_VIRHE'],
                        type: NOTIFICATIONTYPES.ERROR,
                        autoClose: 10000,
                    })
                )
            );
    };

    const passwordsDoNotMatch =
        isValidPassword(newPassword) && !!passwordConfirmation && newPassword !== passwordConfirmation;
    const samePasswordError = !!currentPassword && currentPassword === newPassword;
    const disabled =
        !currentPassword ||
        !newPassword ||
        !passwordConfirmation ||
        newPasswordError ||
        passwordsDoNotMatch ||
        samePasswordError;
    return isLoginParamsLoading ? (
        <Loader />
    ) : (
        <div className="infoPageWrapper" id="email-verification-page">
            <h2 className="oph-h2 oph-bold">{L['SALASANA_VANHENTUNEEN_VAIHTO_OTSIKKO']}</h2>
            <p style={{ textAlign: 'left' }}>{L['SALASANA_VANHENTUNEEN_VAIHTO_OHJE']}</p>
            <p style={{ textAlign: 'left' }}>
                {L['SALASANA_UNOHTUNUT_SALASANA']}{' '}
                <a href={`/cas/login?${new URLSearchParams(data)}`}>{L['SALASANA_PALAA_KIRJAUTUMISEEN']}</a>
            </p>
            <p id="passwordHint" style={{ textAlign: 'left' }}>
                {L['SALASANA_SAANTO']}
            </p>
            <div style={{ textAlign: 'center' }}>
                <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label htmlFor="currentPassword">{L['SALASANA_NYKYINEN_SALASANA']}</label>
                    <input
                        id="currentPassword"
                        value={currentPassword}
                        type="password"
                        className="oph-input"
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        aria-required="true"
                    />
                </div>
                <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label htmlFor="newPassword">{L['SALASANA_UUSI']}</label>
                    <input
                        id="newPassword"
                        value={newPassword}
                        type="password"
                        className={`oph-input ${newPasswordError || samePasswordError ? 'oph-input-has-error' : ''}`}
                        onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (newPasswordError) {
                                setNewPasswordError(newPassword ? !isValidPassword(newPassword) : false);
                            }
                        }}
                        onBlur={() => setNewPasswordError(newPassword ? !isValidPassword(newPassword) : false)}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        aria-invalid={newPasswordError}
                        aria-describedby="passwordIsInvalid passwordHint"
                        aria-required="true"
                    />
                    <span id="passwordIsInvalid" className="error-txt" aria-live="assertive">
                        {newPasswordError && L['SALASANA_EI_TAYTA_VAATIMUKSIA'] + ' '}
                        {samePasswordError && L['SALASANA_VANHA_UUDELLEENREKISTEROINTI'] + ' '}
                    </span>
                </div>
                <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                    <label htmlFor="passwordConfirmation">{L['SALASANA_VAHVISTA']}</label>
                    <input
                        id="passwordConfirmation"
                        value={passwordConfirmation}
                        type="password"
                        className={`oph-input ${passwordsDoNotMatch ? 'oph-input-has-error' : ''}`}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        autoComplete="off"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck="false"
                        aria-invalid={passwordsDoNotMatch}
                        aria-describedby="passwordsDoNotMatch passwordHint"
                        aria-required="true"
                    />
                    <span id="passwordsDoNotMatch" className="error-txt" aria-live="assertive">
                        {passwordsDoNotMatch && L['SALASANA_EI_TASMAA'] + ' '}
                    </span>
                </div>
                <Button id="submit" action={submit} isButton disabled={disabled} big>
                    {L['SALASANA_LAHETA']}
                </Button>
                <div style={{ height: '1.5rem', marginTop: '0.5rem' }}>{isLoading && <Loader />}</div>
            </div>
        </div>
    );
};
