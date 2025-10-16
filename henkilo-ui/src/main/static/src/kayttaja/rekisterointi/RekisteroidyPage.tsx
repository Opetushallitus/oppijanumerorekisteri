import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router';

import StaticUtils from '../../components/common/StaticUtils';
import { isValidPassword } from '../../validation/PasswordValidator';
import type { KutsuByToken, KutsuOrganisaatio } from '../../types/domain/kayttooikeus/Kutsu.types';
import NotificationButton, { ButtonNotification } from '../../components/common/button/NotificationButton';
import { Locale } from '../../types/locale.type';
import { Localisations } from '../../types/localisation.type';
import Asiointikieli from '../../components/common/henkilo/labelvalues/Asiointikieli';
import IconButton from '../../components/common/button/IconButton';
import HakaIcon from '../../components/common/icons/HakaIcon';
import Salasana from '../../components/common/henkilo/labelvalues/Salasana';
import Kayttajanimi from '../../components/common/henkilo/labelvalues/Kayttajanimi';
import Kutsumanimi from '../../components/common/henkilo/labelvalues/Kutsumanimi';
import { toSupportedLocale } from '../../selectors';
import { NamedSelectOption } from '../../utilities/select';
import { RekisteroidyRequest, usePostRekisteroidyMutation } from '../../api/kayttooikeus';
import LabelValue from '../../components/common/henkilo/labelvalues/LabelValue';

import './RekisteroidyPage.css';

type OwnProps = {
    L: Localisations;
    locale: Locale;
    kutsu: KutsuByToken;
};

type ErrorMessage = {
    notL10nMessage: string;
    notL10nText: string;
};

const rekisteroidyErrors: Record<string, ErrorMessage> = {
    NotFoundException: {
        notL10nMessage: '',
        notL10nText: 'REKISTEROIDY_TEMP_TOKEN_INVALID',
    },
    UsernameAlreadyExistsException: {
        notL10nMessage: 'REKISTEROIDY_USERNAMEEXISTS_OTSIKKO',
        notL10nText: 'REKISTEROIDY_USERNAMEEXISTS_TEKSTI',
    },
    PasswordException: {
        notL10nMessage: 'REKISTEROIDY_PASSWORDEXCEPTION_OTSIKKO',
        notL10nText: 'REKISTEROIDY_PASSWORDEXCEPTION_TEKSTI',
    },
    IllegalArgumentException: {
        notL10nMessage: 'REKISTEROIDY_ILLEGALARGUMENT_OTSIKKO',
        notL10nText: 'REKISTEROIDY_ILLEGALARGUMENT_TEKSTI',
    },
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

export const RekisteroidyPage = (props: OwnProps) => {
    const navigate = useNavigate();
    const { kutsu, L, locale: anyLocale } = props;
    const locale = toSupportedLocale(anyLocale);
    const [privacyPolicySeen, setPrivacyPolicySeen] = useState(false);
    const [notification, setNotification] = useState<ButtonNotification>();
    const [rekisteroidy] = usePostRekisteroidyMutation();
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

    function updatePayloadModelInput(event: React.SyntheticEvent<HTMLInputElement>) {
        const newHenkilo = StaticUtils.updateFieldByDotAnnotation({ ...henkilo }, event) || henkilo;
        setHenkilo(newHenkilo);
    }

    function updatePayloadModelSelect(event: NamedSelectOption) {
        const newHenkilo = StaticUtils.updateSelectValueByDotAnnotation({ ...henkilo }, event) || henkilo;
        setHenkilo(newHenkilo);
    }

    async function createHenkilo() {
        setNotification(undefined);
        await rekisteroidy({ token: kutsu.temporaryToken, body: henkilo })
            .unwrap()
            .then(() => navigate(`/kayttaja/rekisteroidy/valmis/${locale}`))
            .catch((error) => {
                setNotification(
                    rekisteroidyErrors[error.data?.errorType] ?? {
                        notL10nMessage: '',
                        notL10nText: 'KUTSU_LUONTI_EPAONNISTUI_TUNTEMATON_VIRHE',
                    }
                );
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

    function isKayttajanimiError() {
        return (
            notification?.notL10nMessage === 'REKISTEROIDY_USERNAMEEXISTS_OTSIKKO' ||
            notification?.notL10nMessage === 'REKISTEROIDY_ILLEGALARGUMENT_OTSIKKO'
        );
    }

    function isSalasanaError() {
        return notification?.notL10nMessage === 'REKISTEROIDY_PASSWORDEXCEPTION_OTSIKKO';
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
                                <p className="oph-h3 oph-bold">{props.L['REKISTEROIDY_PERUSTIEDOT']}</p>
                                <LabelValue
                                    readOnly={true}
                                    values={{
                                        label: 'HENKILO_ETUNIMET',
                                        value: kutsu.etunimi,
                                        inputValue: 'etunimet',
                                        disabled: false,
                                    }}
                                />
                                <LabelValue
                                    readOnly={true}
                                    values={{
                                        label: 'HENKILO_SUKUNIMI',
                                        value: kutsu?.sukunimi,
                                        inputValue: 'sukunimi',
                                        disabled: false,
                                    }}
                                />
                                <Kutsumanimi
                                    readOnly={false}
                                    defaultValue={henkilo.kutsumanimi}
                                    updateModelFieldAction={updatePayloadModelInput}
                                    isError={!etunimetContainsKutsumanimi(henkilo)}
                                />
                                <Kayttajanimi
                                    disabled={false}
                                    defaultValue={henkilo.kayttajanimi}
                                    updateModelFieldAction={updatePayloadModelInput}
                                    isError={isKayttajanimiError() || !kayttajanimiIsNotEmpty(henkilo)}
                                />
                                <Salasana
                                    disabled={false}
                                    updateModelFieldAction={updatePayloadModelInput}
                                    isError={isSalasanaError() || isPasswordError(henkilo)}
                                />
                                <Asiointikieli
                                    henkiloUpdate={henkilo}
                                    updateModelSelectAction={updatePayloadModelSelect}
                                />
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
                                <Asiointikieli
                                    henkiloUpdate={henkilo}
                                    updateModelSelectAction={updatePayloadModelSelect}
                                />
                                <IconButton
                                    href={`/service-provider-app/saml/login/alias/hakasp?${new URLSearchParams({
                                        temporaryToken: kutsu.temporaryToken,
                                    }).toString()}`}
                                >
                                    <HakaIcon />
                                </IconButton>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="wrapper notranslate">
                    <div className="rekisteroidy-organisaatiot-wrapper" style={{ marginBottom: '2em' }}>
                        <ReactMarkdown linkTarget="_blank" className="privacy-policy">
                            {L['REKISTEROIDY_PRIVACY_POLICY']}
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
