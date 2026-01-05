import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import Button from '../../components/common/button/Button';
import { YhteystietoRyhma } from '../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { validateYhteystiedotRyhmaEmails } from '../../utilities/yhteystietoryhma.util';
import { Yhteystieto } from '../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import PropertySingleton from '../../globals/PropertySingleton';
import { WORK_ADDRESS, EMAIL } from '../../types/constants';
import { Localisations } from '../../types/localisation.type';
import { toSupportedLocale } from '../../selectors';
import {
    useLazyGetEmailVerificationLoginTokenValidationQuery,
    usePostEmailVerificationMutation,
} from '../../api/kayttooikeus';
import { validateEmail } from '../../validation/EmailValidator';

import './EmailVerificationList.css';

type Props = {
    L: Localisations;
    locale: string;
    henkilo: Partial<Henkilo>;
    loginToken: string;
    errorNotification: (title?: string) => void;
};

const emptyEmailYhteystieto: Yhteystieto = {
    yhteystietoTyyppi: EMAIL,
    yhteystietoArvo: '',
};

const hasSahkoposti = (yhteystiedotRyhma: YhteystietoRyhma[]) => {
    return yhteystiedotRyhma.some((y) => y.yhteystieto.some((yt) => yt.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI'));
};

const getYhteystiedotRyhmaWithEmail = (henkilo: Partial<Henkilo>) => {
    const yhteystiedotRyhma = structuredClone(henkilo.yhteystiedotRyhma) ?? [];
    if (!hasSahkoposti(yhteystiedotRyhma)) {
        // Jos käyttäjällä ei ole yhteystietoryhmiä ollenkaan, tai jos käyttäjällä on vain muita kuin sähköpostiyhteystietoja
        // niin lisätään uusi tyhjä yhteystietoryhmä ja tyhjä sähköposti-yhteystieto
        if (!yhteystiedotRyhma?.[0]?.yhteystieto || yhteystiedotRyhma?.[0]?.yhteystieto?.length >= 1) {
            const yhteystietoRyhma: YhteystietoRyhma = {
                ryhmaAlkuperaTieto: PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
                ryhmaKuvaus: WORK_ADDRESS,
                yhteystieto: [emptyEmailYhteystieto],
            };

            yhteystiedotRyhma?.push(yhteystietoRyhma);
        } else if (yhteystiedotRyhma?.[0]?.yhteystieto.length === 0) {
            // Jos käyttäjällä on tyhjä yhteystietoryhmä, lisätään tyhjä sähköpostiosoite
            yhteystiedotRyhma?.[0]?.yhteystieto.push(emptyEmailYhteystieto);
        }
    }

    return yhteystiedotRyhma;
};

/*
 * Virkailijan sähköpostin varmentamisen käyttöliittymä
 */
export const EmailVerificationPage = ({ henkilo, loginToken, errorNotification, L, locale: localeProp }: Props) => {
    const navigate = useNavigate();
    const [getEmailVerificationLoginTokenValidation] = useLazyGetEmailVerificationLoginTokenValidationQuery();
    const [postEmailVerification] = usePostEmailVerificationMutation();
    const [yhteystiedotRyhma, setYhteystiedotRyhma] = useState(getYhteystiedotRyhmaWithEmail(henkilo));

    const validForm = useMemo(() => {
        return validateYhteystiedotRyhmaEmails(yhteystiedotRyhma);
    }, [yhteystiedotRyhma]);
    const emailFieldCount = useMemo(() => {
        return yhteystiedotRyhma.filter((y) =>
            y.yhteystieto.some((yt) => yt.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI')
        ).length;
    }, [yhteystiedotRyhma]);

    async function verifyEmailAddresses() {
        const locale = toSupportedLocale(localeProp);
        await getEmailVerificationLoginTokenValidation(loginToken)
            .unwrap()
            .then((responseCode) => {
                if (responseCode !== 'TOKEN_OK') {
                    navigate(`/sahkopostivarmistus/virhe/${locale}/${loginToken}/${responseCode}`);
                }
            });
        await postEmailVerification({ loginToken, body: { ...henkilo, yhteystiedotRyhma } })
            .unwrap()
            .then(() => navigate(`/kayttaja/sahkopostivarmistus/valmis/${locale}`))
            .catch(() => errorNotification(L['REKISTEROIDY_ILLEGALARGUMENT_OTSIKKO']));
    }

    function emailChangeEvent(yhteystiedotRyhmaIndex: number, yhteystietoIndex: number, value: string) {
        const newYhteystiedotRyhma = structuredClone(yhteystiedotRyhma);
        if (newYhteystiedotRyhma?.[yhteystiedotRyhmaIndex]?.yhteystieto?.[yhteystietoIndex]) {
            newYhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto[yhteystietoIndex].yhteystietoArvo = value;
        }
        setYhteystiedotRyhma(newYhteystiedotRyhma);
    }

    function onEmailRemove(yhteystiedotRyhmaIndex: number, yhteystietoIndex: number) {
        const newYhteystiedotRyhma = structuredClone(yhteystiedotRyhma);
        const emailNotOnlyYhteystietoInYhteystietoryhma = newYhteystiedotRyhma[yhteystiedotRyhmaIndex]?.yhteystieto
            .filter((yhteystieto) => yhteystieto.yhteystietoTyyppi !== EMAIL)
            .some((yhteystieto) => !!yhteystieto.yhteystietoArvo);

        if (emailNotOnlyYhteystietoInYhteystietoryhma) {
            const yhteystietoRyhma = newYhteystiedotRyhma[yhteystiedotRyhmaIndex];
            if (yhteystietoRyhma) {
                const yhteystietoClone = [...yhteystietoRyhma.yhteystieto];
                yhteystietoClone.splice(yhteystietoIndex, 1);
                yhteystietoRyhma.yhteystieto = yhteystietoClone;
            }
        } else {
            newYhteystiedotRyhma.splice(yhteystiedotRyhmaIndex, 1);
        }
        setYhteystiedotRyhma(newYhteystiedotRyhma);
    }

    const renderEmail = (yt: Yhteystieto, yhteystiedotRyhmaIndex: number, yhteystietoIndex: number) => {
        const className = `oph-input email-verification-field ${validateEmail(yt.yhteystietoArvo ?? '') ? '' : 'oph-input-has-error'}`;
        return (
            <span key={`${yhteystiedotRyhmaIndex}-${yhteystietoIndex}`}>
                <input
                    className={className}
                    defaultValue={yt.yhteystietoArvo}
                    type="text"
                    placeholder={L['HENKILO_TYOSAHKOPOSTI']}
                    onChange={(event) =>
                        emailChangeEvent(yhteystiedotRyhmaIndex, yhteystietoIndex, event.currentTarget.value)
                    }
                />
                {emailFieldCount > 1 && (
                    <i
                        role="button"
                        tabIndex={0}
                        className="fa fa-times-circle oph-blue email-verification-remove"
                        onClick={() => onEmailRemove(yhteystiedotRyhmaIndex, yhteystietoIndex)}
                    />
                )}
            </span>
        );
    };

    return (
        <div className="infoPageWrapper" id="email-verification-page">
            <h2 className="oph-h2 oph-bold">{L['SAHKOPOSTI_VARMENNUS_OTSIKKO']}</h2>
            <p style={{ textAlign: 'left' }}>
                {L[emailFieldCount > 0 ? 'SAHKOPOSTI_VARMENNUS_OHJE' : 'SAHKOPOSTI_VARMENNUS_EI_OSOITTEITA']}
            </p>
            {yhteystiedotRyhma.map((y, i) =>
                y.yhteystieto.map((yt, j) =>
                    yt.yhteystietoTyyppi === 'YHTEYSTIETO_SAHKOPOSTI' ? renderEmail(yt, i, j) : null
                )
            )}
            <div style={{ textAlign: 'center' }}>
                <Button action={verifyEmailAddresses} isButton disabled={!validForm} big>
                    {L['SAHKOPOSTI_VARMENNUS_JATKA']}
                </Button>
            </div>
        </div>
    );
};
