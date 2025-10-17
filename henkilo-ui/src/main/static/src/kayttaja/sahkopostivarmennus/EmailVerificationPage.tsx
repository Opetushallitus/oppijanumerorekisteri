import React, { useEffect, useState } from 'react';
import { clone, remove } from 'ramda';
import { useNavigate } from 'react-router';

import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import Button from '../../components/common/button/Button';
import { YhteystietoRyhma } from '../../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { EmailVerificationList } from './EmailVerificationList';
import {
    notEmptyYhteystiedotRyhmaEmailCount,
    validateYhteystiedotRyhmaEmails,
} from '../../utilities/yhteystietoryhma.util';
import { Yhteystieto } from '../../types/domain/oppijanumerorekisteri/yhteystieto.types';
import PropertySingleton from '../../globals/PropertySingleton';
import { WORK_ADDRESS, EMAIL } from '../../types/constants';
import { Localisations } from '../../types/localisation.type';
import { toSupportedLocale } from '../../selectors';
import { copy } from '../../utilities/copy';
import {
    useLazyGetEmailVerificationLoginTokenValidationQuery,
    usePostEmailVerificationMutation,
} from '../../api/kayttooikeus';

type Props = {
    L: Localisations;
    locale: string;
    henkilo: Partial<Henkilo>;
    loginToken: string;
    errorNotification: (title?: string) => void;
};

/*
 * Virkailijan sähköpostin varmentamisen käyttöliittymä
 */
export const EmailVerificationPage = ({
    henkilo: henkiloProp,
    loginToken,
    errorNotification,
    L,
    locale: localeProp,
}: Props) => {
    const [getEmailVerificationLoginTokenValidation] = useLazyGetEmailVerificationLoginTokenValidationQuery();
    const [postEmailVerification] = usePostEmailVerificationMutation();
    const navigate = useNavigate();
    const [validForm, setValidForm] = useState(
        henkiloProp.yhteystiedotRyhma ? validateYhteystiedotRyhmaEmails(henkiloProp.yhteystiedotRyhma) : false
    );
    const [henkilo, setHenkilo] = useState(copy(henkiloProp));
    const [emailFieldCount, setEmailFieldCount] = useState(
        notEmptyYhteystiedotRyhmaEmailCount(henkilo.yhteystiedotRyhma)
    );

    useEffect(() => {
        // Lisätään käyttäjän yhteystietoihin tyhjä sähköpostiosoite, jos sellaista ei löydy
        if (emailFieldCount === 0) {
            const yhteystiedotRyhma = clone(henkilo.yhteystiedotRyhma);
            const emptyEmailYhteystieto: Yhteystieto = {
                yhteystietoTyyppi: EMAIL,
                yhteystietoArvo: '',
            };

            // Jos käyttäjällä ei ole yhteystietoryhmiä ollenkaan, tai jos käyttäjällä on vain muita kuin sähköpostiyhteystietoja
            // niin lisätään uusi tyhjä yhteystietoryhmä ja tyhjä sähköposti-yhteystieto
            if (
                henkilo.yhteystiedotRyhma?.length === 0 ||
                !henkilo.yhteystiedotRyhma?.[0]?.yhteystieto ||
                henkilo.yhteystiedotRyhma?.[0]?.yhteystieto?.length >= 1
            ) {
                const yhteystietoRyhma: YhteystietoRyhma = {
                    ryhmaAlkuperaTieto: PropertySingleton.state.YHTEYSTIETO_ALKUPERA_VIRKAILIJA_UI,
                    ryhmaKuvaus: WORK_ADDRESS,
                    yhteystieto: [emptyEmailYhteystieto],
                };

                yhteystiedotRyhma?.push(yhteystietoRyhma);
            } else if (henkilo.yhteystiedotRyhma?.[0]?.yhteystieto.length === 0) {
                // Jos käyttäjällä on tyhjä yhteystietoryhmä, lisätään tyhjä sähköpostiosoite
                yhteystiedotRyhma?.[0]?.yhteystieto.push(emptyEmailYhteystieto);
            }

            setHenkilo({ ...henkilo, yhteystiedotRyhma });
        }
    }, []);

    async function verifyEmailAddresses() {
        const locale = toSupportedLocale(localeProp);
        await getEmailVerificationLoginTokenValidation(loginToken)
            .unwrap()
            .then((responseCode) => {
                if (responseCode !== 'TOKEN_OK') {
                    navigate(`/sahkopostivarmistus/virhe/${locale}/${loginToken}/${responseCode}`);
                }
            });
        await postEmailVerification({ loginToken, body: henkilo })
            .unwrap()
            .then(() => navigate(`/kayttaja/sahkopostivarmistus/valmis/${locale}`))
            .catch(() => errorNotification(L['REKISTEROIDY_ILLEGALARGUMENT_OTSIKKO']));
    }

    function emailChangeEvent(yhteystiedotRyhmaIndex: number, yhteystietoIndex: number, value: string): void {
        const yhteystiedotRyhma = henkilo.yhteystiedotRyhma;
        if (yhteystiedotRyhma?.[yhteystiedotRyhmaIndex]?.yhteystieto?.[yhteystietoIndex]?.yhteystietoArvo) {
            yhteystiedotRyhma[yhteystiedotRyhmaIndex].yhteystieto[yhteystietoIndex].yhteystietoArvo = value;
        }
        const newValidForm = validateYhteystiedotRyhmaEmails(yhteystiedotRyhma);
        setHenkilo({ ...henkilo, yhteystiedotRyhma });
        setValidForm(newValidForm);
    }

    function onEmailRemove(yhteystiedotRyhmaIndex: number, yhteystietoIndex: number): void {
        let yhteystiedotRyhma = henkilo.yhteystiedotRyhma;
        const emailNotOnlyYhteystietoInYhteystietoryhma = yhteystiedotRyhma?.[yhteystiedotRyhmaIndex]?.yhteystieto
            .filter((yhteystieto: Yhteystieto) => yhteystieto.yhteystietoTyyppi !== EMAIL)
            .some(
                (yhteystieto: Yhteystieto) =>
                    yhteystieto.yhteystietoArvo !== '' &&
                    yhteystieto.yhteystietoArvo !== null &&
                    yhteystieto.yhteystietoArvo !== undefined
            );

        if (emailNotOnlyYhteystietoInYhteystietoryhma) {
            const yhteystietoRyhma = yhteystiedotRyhma?.[yhteystiedotRyhmaIndex];
            if (yhteystietoRyhma) {
                yhteystietoRyhma.yhteystieto = remove(yhteystietoIndex, 1, yhteystietoRyhma.yhteystieto);
            }
        } else {
            if (yhteystiedotRyhma) {
                yhteystiedotRyhma = remove(yhteystiedotRyhmaIndex, 1, yhteystiedotRyhma);
            }
        }

        setHenkilo({ ...henkilo, yhteystiedotRyhma });
        setEmailFieldCount(notEmptyYhteystiedotRyhmaEmailCount(yhteystiedotRyhma));
    }

    return (
        <div className="infoPageWrapper" id="email-verification-page">
            <h2 className="oph-h2 oph-bold">{L['SAHKOPOSTI_VARMENNUS_OTSIKKO']}</h2>
            <p style={{ textAlign: 'left' }}>
                {L[emailFieldCount > 0 ? 'SAHKOPOSTI_VARMENNUS_OHJE' : 'SAHKOPOSTI_VARMENNUS_EI_OSOITTEITA']}
            </p>
            <EmailVerificationList
                yhteystiedotRyhma={henkilo.yhteystiedotRyhma}
                onEmailChange={emailChangeEvent}
                onEmailRemove={onEmailRemove}
                L={L}
                emailFieldCount={emailFieldCount}
            />

            <div style={{ textAlign: 'center' }}>
                <Button action={verifyEmailAddresses} isButton disabled={!validForm} big>
                    {L['SAHKOPOSTI_VARMENNUS_JATKA']}
                </Button>
            </div>
        </div>
    );
};
