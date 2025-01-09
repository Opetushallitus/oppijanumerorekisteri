import { EmailOption } from '../types/emailoption.type';
import { YhteystietoRyhma } from '../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { HenkiloState } from '../reducers/henkilo.reducer';
import { MyonnettyKayttooikeusryhma } from '../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { WORK_ADDRESS, EMAIL } from '../types/constants';

type RyhmaId = number;
type CreateEmailOptions = {
    emailSelection: Record<RyhmaId, EmailOption>;
    missingEmail: boolean;
    showMissingEmailNotification: boolean;
    emailOptions: Array<EmailOption>;
};

export const createEmailOptions = (
    henkilo: HenkiloState,
    filterKayttooikeusRyhma: (kayttooikeus: MyonnettyKayttooikeusryhma) => boolean,
    kayttooikeusryhmat: Array<MyonnettyKayttooikeusryhma>
): CreateEmailOptions => {
    const emailOptions = parseEmailOptions(henkilo?.henkilo.yhteystiedotRyhma);
    if (emailOptions.length === 1) {
        return {
            emailSelection: kayttooikeusryhmat.filter(filterKayttooikeusRyhma).reduce(
                (acc, kayttooikeus) => ({
                    ...acc,
                    [kayttooikeus.ryhmaId]: emailOptions[0],
                }),
                {}
            ),
            missingEmail: false,
            showMissingEmailNotification: false,
            emailOptions,
        };
    } else if (emailOptions.length > 1) {
        return {
            missingEmail: false,
            showMissingEmailNotification: false,
            emailOptions,
            emailSelection: kayttooikeusryhmat.filter(filterKayttooikeusRyhma).reduce(
                (acc, kayttooikeus) => ({
                    ...acc,
                    [kayttooikeus.ryhmaId]: emailOptions[0],
                }),
                {}
            ),
        };
    }
    return {
        missingEmail: true,
        showMissingEmailNotification: true,
        emailOptions,
        emailSelection: kayttooikeusryhmat.filter(filterKayttooikeusRyhma).reduce(
            (acc, kayttooikeus) => ({
                ...acc,
                [kayttooikeus.ryhmaId]: { value: '' },
            }),
            {}
        ),
    };
};

export const parseEmailOptions = (yhteystiedot: Array<YhteystietoRyhma>): Array<EmailOption> =>
    (yhteystiedot || [])
        .filter((yhteystietoRyhma) => yhteystietoRyhma.ryhmaKuvaus === WORK_ADDRESS)
        .flatMap((yhteystietoRyhma) => yhteystietoRyhma.yhteystieto)
        .filter((yhteystieto) => yhteystieto.yhteystietoTyyppi === EMAIL)
        .map((yhteystieto) => yhteystieto.yhteystietoArvo)
        .filter((value) => !!value)
        .sort((a, b) => a.localeCompare(b))
        .map((email) => ({ value: email, label: email }));
