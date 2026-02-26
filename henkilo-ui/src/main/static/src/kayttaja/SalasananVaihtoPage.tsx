import React, { useState } from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../selectors';
import Button from '../components/common/button/Button';
import { isValidPassword } from '../validation/PasswordValidator';
import { usePostSalasananVaihtoMutation } from '../api/kayttooikeus';
import { useAppDispatch } from './store';
import Loader from '../components/common/icons/Loader';
import { useTitle } from '../useTitle';
import { add } from '../slices/toastSlice';

export const SalasananVaihtoPage = () => {
    const params = useParams();
    const { getLocalisations } = useLocalisations();
    const L = getLocalisations(params.locale);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordError, setNewPasswordError] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [postPasswordChange, { isLoading }] = usePostSalasananVaihtoMutation();
    const [passwordChanged, setPasswordChanged] = useState(false);
    const dispatch = useAppDispatch();

    useTitle(L['TITLE_SALASANANVAIHTO']);

    const submit = async () => {
        if (!params.loginToken) {
            return;
        }
        postPasswordChange({ loginToken: params.loginToken, newPassword, currentPassword })
            .unwrap()
            .then(() => setPasswordChanged(true))
            .catch(() =>
                dispatch(
                    add({
                        id: `PASSWORD_CHANGE_ERROR-${Math.random()}`,
                        header: L['SALASANA_VIRHE'],
                        type: 'error',
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
    return (
        <div className="infoPageWrapper" id="password-change-page">
            {passwordChanged ? (
                <>
                    <h2 id="passwordChangeSuccess" className="oph-h2 oph-bold">
                        {L['SALASANA_VAIHTO_ONNISTUI_OTSIKKO']}
                    </h2>
                    <p style={{ textAlign: 'left' }}>{L['SALASANAN_VAIHTO_ONNISTUI_TEKSTI']}</p>
                    <a id="returnLink" href="/">
                        {L['LINKKI_VIRKAILIJA_OPINTOPOLUN_ETUSIVULLE']}
                    </a>
                </>
            ) : (
                <>
                    <h2 className="oph-h2 oph-bold">{L['SALASANA_VANHENTUNEEN_VAIHTO_OTSIKKO']}</h2>
                    <p style={{ textAlign: 'left' }}>{L['SALASANA_VANHENTUNEEN_VAIHTO_OHJE']}</p>
                    <p style={{ textAlign: 'left' }}>
                        {L['SALASANA_UNOHTUNUT_SALASANA']}{' '}
                        <a href="/service-provider-app/saml/logout">{L['SALASANA_PALAA_KIRJAUTUMISEEN']}</a>
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
                                className={`oph-input ${
                                    newPasswordError || samePasswordError ? 'oph-input-has-error' : ''
                                }`}
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
                </>
            )}
        </div>
    );
};
