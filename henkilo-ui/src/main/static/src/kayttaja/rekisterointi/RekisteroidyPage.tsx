import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router';
import Select from 'react-select';

import { isValidPassword } from '../../validation/PasswordValidator';
import type { KutsuByToken, KutsuOrganisaatio } from '../../types/domain/kayttooikeus/Kutsu.types';
import NotificationButton, { ButtonNotification } from '../../components/common/button/NotificationButton';
import { Locale } from '../../types/locale.type';
import { Localisations } from '../../types/localisation.type';
import hakaImg from '../../img/haka_landscape_medium.gif';
import { toSupportedLocale, useAsiointikielet } from '../../selectors';
import { RekisteroidyRequest, usePostRekisteroidyMutation } from '../../api/kayttooikeus';

import './RekisteroidyPage.css';

type OwnProps = {
    L: Localisations;
    locale: Locale;
    kutsu: KutsuByToken;
};

const getNotification = (errorData: string): ButtonNotification => {
    if (errorData.includes('NotFoundException')) {
        return {
            notL10nMessage: '',
            notL10nText: 'REKISTEROIDY_TEMP_TOKEN_INVALID',
        };
    }
    if (errorData.includes('UsernameAlreadyExistsException')) {
        return {
            notL10nMessage: 'REKISTEROIDY_USERNAMEEXISTS_OTSIKKO',
            notL10nText: 'REKISTEROIDY_USERNAMEEXISTS_TEKSTI',
        };
    }
    if (errorData.includes('PasswordException')) {
        return {
            notL10nMessage: 'REKISTEROIDY_PASSWORDEXCEPTION_OTSIKKO',
            notL10nText: 'REKISTEROIDY_PASSWORDEXCEPTION_TEKSTI',
        };
    }
    if (errorData.includes('IllegalArgumentException')) {
        return {
            notL10nMessage: 'REKISTEROIDY_ILLEGALARGUMENT_OTSIKKO',
            notL10nText: 'REKISTEROIDY_ILLEGALARGUMENT_TEKSTI',
        };
    }
    return {
        notL10nMessage: '',
        notL10nText: 'KUTSU_LUONTI_EPAONNISTUI_TUNTEMATON_VIRHE',
    };
};

function etunimetContainsKutsumanimi(henkilo: RekisteroidyRequest) {
    return henkilo.etunimet.split(' ').filter((nimi) => nimi === henkilo.kutsumanimi).length;
}

function passwordsAreSame(henkilo: RekisteroidyRequest) {
    return henkilo.password === henkilo.passwordAgain;
}

function kielikoodiIsNotEmpty(henkilo: RekisteroidyRequest) {
    return !!henkilo.asiointiKieli.kieliKoodi;
}

function kayttajanimiIsNotEmpty(henkilo: RekisteroidyRequest) {
    return !!henkilo.kayttajanimi;
}

function isPasswordError(henkilo: RekisteroidyRequest) {
    return !henkilo.password || !isValidPassword(henkilo.password) || henkilo.password !== henkilo.passwordAgain;
}

const errorChecks = [
    (henkilo: RekisteroidyRequest) => (!etunimetContainsKutsumanimi(henkilo) ? 'REKISTEROIDY_ERROR_KUTSUMANIMI' : null),
    (henkilo: RekisteroidyRequest) => (!kayttajanimiIsNotEmpty(henkilo) ? 'REKISTEROIDY_ERROR_KAYTTAJANIMI' : null),
    (henkilo: RekisteroidyRequest) => (!passwordsAreSame(henkilo) ? 'REKISTEROIDY_ERROR_PASSWORD_MATCH' : null),
    (henkilo: RekisteroidyRequest) =>
        !isValidPassword(henkilo.password) ? 'REKISTEROIDY_ERROR_PASSWORD_INVALID' : null,
    (henkilo: RekisteroidyRequest) => (!kielikoodiIsNotEmpty(henkilo) ? 'REKISTEROIDY_ERROR_KIELIKOODI' : null),
];

function validate(henkilo: RekisteroidyRequest) {
    return (
        etunimetContainsKutsumanimi(henkilo) &&
        kayttajanimiIsNotEmpty(henkilo) &&
        passwordsAreSame(henkilo) &&
        isValidPassword(henkilo.password) &&
        kielikoodiIsNotEmpty(henkilo)
    );
}

function isKayttajanimiError(notification?: ButtonNotification) {
    return (
        notification?.notL10nMessage === 'REKISTEROIDY_USERNAMEEXISTS_OTSIKKO' ||
        notification?.notL10nMessage === 'REKISTEROIDY_ILLEGALARGUMENT_OTSIKKO'
    );
}

function isSalasanaError(notification?: ButtonNotification) {
    return notification?.notL10nMessage === 'REKISTEROIDY_PASSWORDEXCEPTION_OTSIKKO';
}

export const RekisteroidyPage = (props: OwnProps) => {
    const navigate = useNavigate();
    const { kutsu, L, locale: anyLocale } = props;
    const locale = toSupportedLocale(anyLocale);
    const [privacyPolicySeen, setPrivacyPolicySeen] = useState(false);
    const [notification, setNotification] = useState<ButtonNotification>();
    const [rekisteroidy] = usePostRekisteroidyMutation();
    const asiointikielet = useAsiointikielet(locale);
    const [henkilo, setHenkilo] = useState<RekisteroidyRequest>({
        etunimet: kutsu.etunimi,
        sukunimi: kutsu.sukunimi,
        kutsumanimi: kutsu.etunimi.split(' ')[0] || '',
        asiointiKieli: {
            kieliKoodi: kutsu.asiointikieli,
        },
        kayttajanimi: '',
        password: '',
        passwordAgain: '',
    });

    useEffect(() => {
        if (kutsu.hakaIdentifier) {
            createHenkilo();
        }
    }, []);

    async function createHenkilo() {
        setNotification(undefined);
        await rekisteroidy({ token: kutsu.temporaryToken, body: henkilo })
            .unwrap()
            .then(() => navigate(`/kayttaja/rekisteroidy/valmis/${locale}`))
            .catch((error) => {
                setNotification(getNotification(error.data));
            });
    }

    function printErrors() {
        return errorChecks.map((errorCheck, idx) => {
            const errorTranslation = errorCheck(henkilo);
            return errorTranslation ? (
                <li key={idx} className="oph-h5 oph-red">
                    ! {L[errorTranslation]}
                </li>
            ) : null;
        });
    }

    const renderKutsuOrganisaatio = (organisaatio: KutsuOrganisaatio) => {
        return (
            <div key={organisaatio.organisaatioOid} className="organisaatio-kayttooikeus-wrapper">
                <p className="oph-bold">{organisaatio.nimi[locale] || organisaatio.organisaatioOid}</p>
                <ul>
                    {organisaatio.kayttoOikeusRyhmat.map((kayttooikeusRyhma) => (
                        <li key={kayttooikeusRyhma.id}>{kayttooikeusRyhma.nimi[locale] || kayttooikeusRyhma.id}</li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
        <div className="borderless-colored-wrapper rekisteroidy-page" style={{ marginTop: '50px' }}>
            <div className="header-borderless">
                <p className="oph-h2 oph-bold">{L['REKISTEROIDY_OTSIKKO']}</p>
            </div>
            {privacyPolicySeen ? (
                <div>
                    <div className="wrapper">
                        <div className="rekisteroidy-organisaatiot-wrapper">
                            <p className="oph-h3 oph-bold">{L['REKISTEROIDY_ORGANISAATIOT_OTSIKKO']}</p>
                            {kutsu.organisaatiot.map(renderKutsuOrganisaatio)}
                        </div>
                    </div>
                    <div className="flex-horizontal">
                        <div className="wrapper flex-item-1">
                            <div>
                                <p className="oph-h3 oph-bold">{L['REKISTEROIDY_PERUSTIEDOT']}</p>
                                <div className="labelValue label-row">
                                    <div className="oph-bold">{L['HENKILO_ETUNIMET']}</div>
                                    <div>{kutsu.etunimi}</div>
                                </div>
                                <div className="labelValue label-row">
                                    <div className="oph-bold">{L['HENKILO_SUKUNIMI']}</div>
                                    <div>{kutsu.sukunimi}</div>
                                </div>
                                <div className="labelValue">
                                    <span className="oph-bold">{L['HENKILO_KUTSUMANIMI']}</span>
                                    <input
                                        id="kutsumanimi"
                                        className={`oph-input ${
                                            !etunimetContainsKutsumanimi(henkilo) ? 'oph-input-has-error' : ''
                                        }`}
                                        defaultValue={henkilo.kutsumanimi}
                                        onChange={(e) => setHenkilo({ ...henkilo, kutsumanimi: e.target.value })}
                                    />
                                </div>
                                <div className="labelValue">
                                    <span className="oph-bold">{L['HENKILO_KAYTTAJANIMI']}</span>
                                    <input
                                        id="kayttajanimi"
                                        className={`oph-input ${
                                            isKayttajanimiError(notification) || !kayttajanimiIsNotEmpty(henkilo)
                                                ? 'oph-input-has-error'
                                                : ''
                                        }`}
                                        defaultValue={henkilo.kayttajanimi}
                                        onChange={(e) => setHenkilo({ ...henkilo, kayttajanimi: e.target.value })}
                                    />
                                </div>
                                <div className="labelValue">
                                    <span className="oph-bold">{L['HENKILO_PASSWORD']}</span>
                                    <input
                                        id="password"
                                        type="password"
                                        className={`oph-input ${
                                            isSalasanaError(notification) || !isValidPassword(henkilo.password)
                                                ? 'oph-input-has-error'
                                                : ''
                                        }`}
                                        defaultValue={henkilo.password}
                                        onChange={(e) => setHenkilo({ ...henkilo, password: e.target.value })}
                                    />
                                </div>
                                <div className="labelValue">
                                    <span className="oph-bold">{L['HENKILO_PASSWORDAGAIN']}</span>
                                    <input
                                        id="passwordAgain"
                                        type="password"
                                        className={`oph-input ${
                                            isSalasanaError(notification) || isPasswordError(henkilo)
                                                ? 'oph-input-has-error'
                                                : ''
                                        }`}
                                        defaultValue={henkilo.passwordAgain}
                                        onChange={(e) => setHenkilo({ ...henkilo, passwordAgain: e.target.value })}
                                    />
                                    <span>{L['REKISTEROIDY_PASSWORD_TEXT']}</span>
                                </div>
                                <div className="labelValue">
                                    <span className="oph-bold">{L['HENKILO_ASIOINTIKIELI'] + '*'}</span>
                                    <Select
                                        options={asiointikielet}
                                        value={asiointikielet.find(
                                            (o) => o.value === henkilo.asiointiKieli?.kieliKoodi
                                        )}
                                        onChange={(o) =>
                                            setHenkilo({
                                                ...henkilo,
                                                asiointiKieli: { kieliKoodi: o?.value ?? 'kieli_fi' },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <NotificationButton
                                action={createHenkilo}
                                disabled={!validate(henkilo)}
                                notification={notification}
                                removeNotification={() => setNotification(undefined)}
                            >
                                {L['REKISTEROIDY_TALLENNA_NAPPI']}
                            </NotificationButton>
                            <ul>{printErrors()}</ul>
                        </div>
                        <div className="borderless-colored-wrapper flex-horizontal flex-align-center">
                            <span className="oph-h3 oph-bold">{L['REKISTEROIDY_VALITSE']}</span>
                        </div>
                        <div className="wrapper flex-item-1">
                            <div>
                                <p className="oph-h3 oph-bold">{L['REKISTEROIDY_HAKA_OTSIKKO']}</p>
                                <Select
                                    options={asiointikielet}
                                    value={asiointikielet.find((o) => o.value === henkilo.asiointiKieli?.kieliKoodi)}
                                    onChange={(o) =>
                                        setHenkilo({
                                            ...henkilo,
                                            asiointiKieli: { kieliKoodi: o?.value ?? 'kieli_fi' },
                                        })
                                    }
                                />
                                <a
                                    href={`/service-provider-app/saml/login/alias/hakasp?${new URLSearchParams({
                                        temporaryToken: kutsu.temporaryToken,
                                    }).toString()}`}
                                >
                                    <img src={hakaImg} alt="" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="wrapper notranslate">
                    <div className="rekisteroidy-organisaatiot-wrapper" style={{ marginBottom: '2em' }}>
                        <ReactMarkdown linkTarget="_blank" className="privacy-policy">
                            {L['REKISTEROIDY_PRIVACY_POLICY'] ?? ''}
                        </ReactMarkdown>
                    </div>
                    <NotificationButton action={() => setPrivacyPolicySeen(true)}>
                        {L['REKISTEROIDY_ACCEPT_PRIVACY_POLICY']}
                    </NotificationButton>
                </div>
            )}
        </div>
    );
};
