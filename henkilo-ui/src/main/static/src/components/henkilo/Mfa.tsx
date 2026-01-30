import React, { ReactNode, useId, useRef, useState } from 'react';
import PinInput from 'react-pin-input';

import {
    useGetKayttajatiedotQuery,
    useGetMfaSetupQuery,
    useGetOmattiedotQuery,
    usePostMfaDisableMutation,
    usePostMfaEnableMutation,
} from '../../api/kayttooikeus';
import appleStore from '../../img/apple_store.svg';
import googlePlay from '../../img/google_play.svg';
import Loader from '../common/icons/Loader';
import { Localisations } from '../../types/localisation.type';
import { View } from '../../types/constants';
import { useLocalisations } from '../../selectors';
import { useAppDispatch } from '../../store';
import { add } from '../../slices/toastSlice';

import styles from './Mfa.module.css';

const PhoneIcon = () => (
    <svg width="17" height="23" viewBox="0 0 17 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M11.2787 15.7607C11.0454 15.7607 10.8454 15.6774 10.6787 15.5107C10.512 15.3441 10.4287 15.1441 10.4287 14.9107V11.6107C10.4287 11.3774 10.512 11.1774 10.6787 11.0107C10.8454 10.8441 11.0454 10.7607 11.2787 10.7607H11.4287V9.76074C11.4287 9.21074 11.6244 8.73974 12.0157 8.34774C12.4077 7.95641 12.8787 7.76074 13.4287 7.76074C13.9787 7.76074 14.4497 7.95641 14.8417 8.34774C15.233 8.73974 15.4287 9.21074 15.4287 9.76074V10.7607H15.5787C15.812 10.7607 16.012 10.8441 16.1787 11.0107C16.3454 11.1774 16.4287 11.3774 16.4287 11.6107V14.9107C16.4287 15.1441 16.3454 15.3441 16.1787 15.5107C16.012 15.6774 15.812 15.7607 15.5787 15.7607H11.2787ZM12.4287 10.7607H14.4287V9.76074C14.4287 9.47741 14.3327 9.23974 14.1407 9.04774C13.9494 8.85641 13.712 8.76074 13.4287 8.76074C13.1454 8.76074 12.908 8.85641 12.7167 9.04774C12.5247 9.23974 12.4287 9.47741 12.4287 9.76074V10.7607ZM2.42871 22.7607C1.87871 22.7607 1.40804 22.5651 1.01671 22.1737C0.624711 21.7817 0.428711 21.3107 0.428711 20.7607V2.76074C0.428711 2.21074 0.624711 1.73974 1.01671 1.34774C1.40804 0.956409 1.87871 0.760742 2.42871 0.760742H12.4287C12.9787 0.760742 13.4497 0.956409 13.8417 1.34774C14.233 1.73974 14.4287 2.21074 14.4287 2.76074V6.76074H12.4287V5.76074H2.42871V17.7607H12.4287V16.7607H14.4287V20.7607C14.4287 21.3107 14.233 21.7817 13.8417 22.1737C13.4497 22.5651 12.9787 22.7607 12.4287 22.7607H2.42871ZM2.42871 19.7607V20.7607H12.4287V19.7607H2.42871ZM2.42871 3.76074H12.4287V2.76074H2.42871V3.76074Z"
            fill="#1C1B1F"
        />
    </svg>
);

const StepOneIcon = () => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16.98" cy="16.855" r="16.355" fill="#0A789C" />
        <path
            d="M18.1904 23.5H15.1729V15.2383C15.1729 15.0104 15.1761 14.7305 15.1826 14.3984C15.1891 14.0599 15.1989 13.7148 15.2119 13.3633C15.2249 13.0052 15.238 12.6829 15.251 12.3965C15.1794 12.4811 15.0329 12.6276 14.8115 12.8359C14.5967 13.0378 14.3949 13.2201 14.2061 13.3828L12.5654 14.7012L11.1104 12.8848L15.71 9.22266H18.1904V23.5ZM22.5166 22.1035C22.5166 21.4915 22.6826 21.0618 23.0146 20.8145C23.3532 20.5671 23.7601 20.4434 24.2354 20.4434C24.6976 20.4434 25.0947 20.5671 25.4268 20.8145C25.7653 21.0618 25.9346 21.4915 25.9346 22.1035C25.9346 22.6895 25.7653 23.1126 25.4268 23.373C25.0947 23.6335 24.6976 23.7637 24.2354 23.7637C23.7601 23.7637 23.3532 23.6335 23.0146 23.373C22.6826 23.1126 22.5166 22.6895 22.5166 22.1035Z"
            fill="white"
        />
    </svg>
);

const StepTwoIcon = () => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16.6489" cy="16.855" r="16.355" fill="#0A789C" />
        <path
            d="M20.5879 23.5H10.6074V21.4004L14.1914 17.7773C14.9141 17.0352 15.4935 16.4167 15.9297 15.9219C16.3724 15.4206 16.6914 14.9648 16.8867 14.5547C17.0885 14.1445 17.1895 13.7051 17.1895 13.2363C17.1895 12.6699 17.0299 12.2467 16.7109 11.9668C16.3984 11.6803 15.9785 11.5371 15.4512 11.5371C14.8978 11.5371 14.3607 11.6641 13.8398 11.918C13.319 12.1719 12.7754 12.5332 12.209 13.002L10.5684 11.0586C10.9785 10.707 11.4115 10.375 11.8672 10.0625C12.3294 9.75 12.8633 9.49935 13.4688 9.31055C14.0807 9.11523 14.8132 9.01758 15.666 9.01758C16.6035 9.01758 17.4076 9.18685 18.0781 9.52539C18.7552 9.86393 19.276 10.3262 19.6406 10.9121C20.0052 11.4915 20.1875 12.1491 20.1875 12.8848C20.1875 13.6725 20.0312 14.3919 19.7188 15.043C19.4062 15.694 18.9505 16.3385 18.3516 16.9766C17.7591 17.6146 17.043 18.321 16.2031 19.0957L14.3672 20.8242V20.9609H20.5879V23.5ZM22.3945 22.1035C22.3945 21.4915 22.5605 21.0618 22.8926 20.8145C23.2311 20.5671 23.638 20.4434 24.1133 20.4434C24.5755 20.4434 24.9727 20.5671 25.3047 20.8145C25.6432 21.0618 25.8125 21.4915 25.8125 22.1035C25.8125 22.6895 25.6432 23.1126 25.3047 23.373C24.9727 23.6335 24.5755 23.7637 24.1133 23.7637C23.638 23.7637 23.2311 23.6335 22.8926 23.373C22.5605 23.1126 22.3945 22.6895 22.3945 22.1035Z"
            fill="white"
        />
    </svg>
);

const StepThreeIcon = () => (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16.8579" cy="16.855" r="16.355" fill="#0A789C" />
        <path
            d="M19.8223 12.416C19.8223 13.0736 19.6855 13.6432 19.4121 14.125C19.1387 14.6068 18.7676 15.0007 18.2988 15.3066C17.8366 15.6126 17.3158 15.8372 16.7363 15.9805V16.0391C17.8822 16.1823 18.7513 16.5339 19.3438 17.0938C19.9427 17.6536 20.2422 18.4023 20.2422 19.3398C20.2422 20.1732 20.0371 20.9186 19.627 21.5762C19.2233 22.2337 18.5983 22.7513 17.752 23.1289C16.9056 23.5065 15.8151 23.6953 14.4805 23.6953C13.6927 23.6953 12.957 23.6302 12.2734 23.5C11.5964 23.3763 10.9583 23.1842 10.3594 22.9238V20.3555C10.9714 20.668 11.6126 20.9056 12.2832 21.0684C12.9538 21.2246 13.5788 21.3027 14.1582 21.3027C15.2389 21.3027 15.9941 21.1172 16.4238 20.7461C16.86 20.3685 17.0781 19.8411 17.0781 19.1641C17.0781 18.7669 16.9772 18.4316 16.7754 18.1582C16.5736 17.8848 16.222 17.6764 15.7207 17.5332C15.2259 17.39 14.5326 17.3184 13.6406 17.3184H12.5566V15.0039H13.6602C14.5391 15.0039 15.2064 14.9225 15.6621 14.7598C16.1243 14.5905 16.4368 14.3626 16.5996 14.0762C16.7689 13.7832 16.8535 13.4512 16.8535 13.0801C16.8535 12.5723 16.6973 12.1751 16.3848 11.8887C16.0723 11.6022 15.5514 11.459 14.8223 11.459C14.3665 11.459 13.9499 11.5176 13.5723 11.6348C13.2012 11.7454 12.8659 11.8822 12.5664 12.0449C12.2669 12.2012 12.0033 12.3542 11.7754 12.5039L10.3789 10.4238C10.9388 10.0202 11.5931 9.6849 12.3418 9.41797C13.097 9.15104 13.9954 9.01758 15.0371 9.01758C16.5085 9.01758 17.6738 9.3138 18.5332 9.90625C19.3926 10.4987 19.8223 11.3353 19.8223 12.416ZM22.1855 22.1035C22.1855 21.4915 22.3516 21.0618 22.6836 20.8145C23.0221 20.5671 23.429 20.4434 23.9043 20.4434C24.3665 20.4434 24.7637 20.5671 25.0957 20.8145C25.4342 21.0618 25.6035 21.4915 25.6035 22.1035C25.6035 22.6895 25.4342 23.1126 25.0957 23.373C24.7637 23.6335 24.3665 23.7637 23.9043 23.7637C23.429 23.7637 23.0221 23.6335 22.6836 23.373C22.3516 23.1126 22.1855 22.6895 22.1855 22.1035Z"
            fill="white"
        />
    </svg>
);

const isMfaSetupEnabled = (idpEntityId?: string) => {
    return (
        idpEntityId === 'vetuma' ||
        window?.location.hostname.includes('hahtuvaopintopolku') ||
        window?.location.hostname.includes('untuvaopintopolku')
    );
};

type MfaRegisteredProps = {
    L: Localisations;
    idpEntityId?: string;
};

const MfaRegistered = ({ L, idpEntityId }: MfaRegisteredProps) => {
    const dispatch = useAppDispatch();
    const [postMfaDisable, { isLoading }] = usePostMfaDisableMutation();
    const [setupError, setSetupError] = useState<string>();

    const handleMfaDisable = async () => {
        setSetupError(undefined);
        await postMfaDisable()
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `enable-mfa-${Math.random()}`,
                        type: 'ok',
                        header: L.MFA_POISTETTU_KAYTOSTA,
                    })
                );
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `enable-mfa-${Math.random()}`,
                        type: 'error',
                        header: L.MFA_VIRHE,
                    })
                );
            });
    };

    return (
        <div className={styles.infoBody}>
            <div className={styles.icon}>
                <PhoneIcon />
            </div>
            <div>
                <p className={styles.infoText}>{L.MFA_REKISTEROITY_INFO}</p>
                <div>
                    {isMfaSetupEnabled(idpEntityId) ? (
                        <>
                            <button
                                className={`oph-button oph-button-primary ${styles.setupButton}`}
                                onClick={handleMfaDisable}
                                data-test-id="disable-mfa"
                                disabled={isLoading}
                            >
                                {L.MFA_POISTA_KAYTOSTA}
                            </button>
                            {setupError && <span className="error-txt">{setupError}</span>}
                        </>
                    ) : (
                        <>
                            <a
                                className={`oph-button oph-button-primary ${styles.setupButton}`}
                                href="/service-provider-app/saml/logout"
                                data-test-id="login-suomifi"
                            >
                                {L.MFA_KIRJAUDU_ULOS_SUOMIFI_TUNNISTUKSEEN}
                            </a>
                            <span className={styles.greyInfo}>{L.MFA_SUOMIFI_DISABLE}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

type MfaUnregisteredProps = {
    setMfaSetup: (b: boolean) => void;
    L: Localisations;
    idpEntityId?: string;
};

const MfaUnregistered = ({ setMfaSetup, L, idpEntityId }: MfaUnregisteredProps) => {
    return (
        <div className={styles.infoBody}>
            <div className={styles.icon}>
                <PhoneIcon />
            </div>
            <div>
                <p className={styles.infoText}>{L.MFA_OTA_KAYTTOON_INFO}</p>
                <div>
                    {isMfaSetupEnabled(idpEntityId) ? (
                        <button
                            className={`oph-button oph-button-primary ${styles.setupButton}`}
                            onClick={() => setMfaSetup(true)}
                            data-test-id="start-mfa-setup"
                        >
                            {L.MFA_OTA_KAYTTOON}
                        </button>
                    ) : (
                        <>
                            <a
                                className={`oph-button oph-button-primary ${styles.setupButton}`}
                                href="/service-provider-app/saml/logout"
                                data-test-id="login-suomifi"
                            >
                                {L.MFA_KIRJAUDU_ULOS_SUOMIFI_TUNNISTUKSEEN}
                            </a>
                            <span className={styles.greyInfo}>{L.MFA_SUOMIFI}</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

type MfaSetupStepProps = {
    icon: ReactNode;
    info: string;
    children: ReactNode;
};

const MfaSetupStep = ({ icon, info, children }: MfaSetupStepProps) => {
    return (
        <div className={styles.setupStep}>
            <div className={styles.icon}>{icon}</div>
            <div>
                <div className={styles.setupStepInfo}>{info}</div>
                <div>{children}</div>
            </div>
        </div>
    );
};

type MfaSetupProps = {
    setMfaSetup: (b: boolean) => void;
    L: Localisations;
};

const MfaSetup = ({ setMfaSetup, L }: MfaSetupProps) => {
    const dispatch = useAppDispatch();
    const { data, isLoading: isGetLoading, isSuccess } = useGetMfaSetupQuery();
    const [postMfaEnable, { isLoading: isPostLoading }] = usePostMfaEnableMutation();
    const pinInput = useRef<PinInput>(null);

    if (isGetLoading) {
        return <Loader />;
    }
    if (!isSuccess) {
        return (
            <div className="error-txt" data-test-id="setup-error">
                {L.MFA_TIETOJEN_HAKU_EPAONNISTUI}
            </div>
        );
    }

    const copySecretKey = async () => {
        await navigator?.clipboard?.writeText(data.secretKey);
    };

    const handleMfaEnable = async (token: string) => {
        await postMfaEnable(token)
            .unwrap()
            .then((enabled) => {
                if (enabled) {
                    dispatch(
                        add({
                            id: `enable-mfa-${Math.random()}`,
                            type: 'ok',
                            header: L.MFA_OTETTU_KAYTTOON,
                        })
                    );
                    setMfaSetup(false);
                } else {
                    dispatch(
                        add({
                            id: `enable-mfa-${Math.random()}`,
                            type: 'error',
                            header: L.MFA_VIRHE,
                        })
                    );
                }
            })
            .catch((e) => {
                if (e.data.message === 'Invalid token') {
                    dispatch(
                        add({
                            id: `enable-mfa-${Math.random()}`,
                            type: 'error',
                            header: L.MFA_VAARA_KOODI,
                        })
                    );
                    pinInput.current?.clear();
                    pinInput.current?.focus();
                } else {
                    dispatch(
                        add({
                            id: `enable-mfa-${Math.random()}`,
                            type: 'error',
                            header: L.MFA_VIRHE,
                        })
                    );
                }
            });
    };

    return (
        <div>
            <div className={styles.setupContainer}>
                <MfaSetupStep icon={<StepOneIcon />} info={L.MFA_LATAA_APP_INFO!}>
                    <a
                        href="https://apps.apple.com/us/app/google-authenticator/id388497605"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img src={appleStore} alt="Apple Store" width="180" height="53" />
                    </a>
                    <br />
                    <a
                        href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en_IE&gl=US"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <img src={googlePlay} alt="GooglePlay" width="180" height="53" />
                    </a>
                </MfaSetupStep>
                <MfaSetupStep icon={<StepTwoIcon />} info={L.MFA_LUE_QR_KOODI_INFO!}>
                    <img src={data.qrCodeDataUri} alt={data.secretKey} width="180" height="180" />
                </MfaSetupStep>
                <MfaSetupStep icon={<StepThreeIcon />} info={L.MFA_SYOTA_KOODI_INFO!}>
                    <PinInput
                        length={6}
                        initialValue=""
                        type="numeric"
                        inputMode="number"
                        style={{
                            padding: '12px',
                            background: '#F8F8F8',
                            border: '1px solid #E1DEDE',
                            borderRadius: '4px',
                        }}
                        inputStyle={{
                            backgroundColor: '#FFF',
                            borderColor: '#137CA0',
                            borderRadius: '3px',
                            fontSize: '24px',
                            width: '34px',
                            height: '34px',
                            fontWeight: 600,
                            margin: 0,
                        }}
                        inputFocusStyle={{ borderColor: '#137CA0' }}
                        onComplete={handleMfaEnable}
                        regexCriteria={/^\d*$/}
                        disabled={isPostLoading}
                        ref={pinInput}
                    />
                    {isPostLoading && <div>{L.MFA_OTETAAN_KAYTTOON}</div>}
                </MfaSetupStep>
            </div>
            <hr className={styles.hr} />
            <div className={styles.greyInfo}>
                {L.MFA_KOODI_VAIHTOEHTO_INFO}{' '}
                <span
                    className={styles.secretKey}
                    data-test-id="secret-key"
                    onClick={copySecretKey}
                    role="button"
                    tabIndex={0}
                >
                    {data.secretKey?.match(/.{1,4}/g)?.map((chunk, idx) => (
                        <span className={styles.secretKeyChunk} key={`secret-key-${idx}`}>
                            {chunk}
                        </span>
                    ))}
                </span>
            </div>
        </div>
    );
};

type MfaProps = {
    henkiloOid: string;
    view: View;
};

const Mfa = ({ view, henkiloOid }: MfaProps) => {
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(henkiloOid);
    const userMfaProvider = view === 'omattiedot' ? omattiedot?.mfaProvider : kayttajatiedot?.mfaProvider;
    const { L } = useLocalisations();
    const [isMfaSetup, setMfaSetup] = useState(false);
    const mfaSectionLabelId = useId();

    const mfaSetupComponent = isMfaSetup ? (
        <MfaSetup setMfaSetup={setMfaSetup} L={L} />
    ) : (
        <MfaUnregistered setMfaSetup={setMfaSetup} L={L} idpEntityId={omattiedot?.idpEntityId} />
    );
    const mfaStateComponent = omattiedot?.mfaProvider ? (
        <MfaRegistered L={L} idpEntityId={omattiedot?.idpEntityId} />
    ) : (
        mfaSetupComponent
    );
    return (
        <section aria-labelledby={mfaSectionLabelId} className="henkiloViewUserContentWrapper">
            <h2 id={mfaSectionLabelId}>{L.TIETOTURVA_ASETUKSET_OTSIKKO}</h2>
            <div className={styles.infoTitle}>
                <span className={styles.mfaTitle}>
                    {L.MFA_TUNNISTAUTUMINEN}
                    {isMfaSetup && ` - ${L.MFA_KAYTTOONOTTO}`}
                </span>
                {!isMfaSetup && (
                    <span className={styles.mfaEnabled} data-test-id="mfa-status">
                        {userMfaProvider ? L.MFA_KAYTOSSA : L.MFA_EI_KAYTOSSA}
                    </span>
                )}
            </div>
            {view === 'omattiedot' && mfaStateComponent}
        </section>
    );
};

export default Mfa;
