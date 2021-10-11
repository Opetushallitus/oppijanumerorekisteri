import { EmailOption } from '../types/emailoption.type';
import { HenkiloState } from '../reducers/henkilo.reducer';
import { MyonnettyKayttooikeusryhma } from '../types/domain/kayttooikeus/kayttooikeusryhma.types';
import { WORK_ADDRESS } from '../types/domain/oppijanumerorekisteri/yhteystietoryhma.types';
import { EMAIL } from '../types/domain/oppijanumerorekisteri/yhteystieto.types';

type CreateEmailOptions = {
    emailSelection: Array<EmailOption>;
    missingEmail: boolean;
    showMissingEmailNotification: boolean;
    emailOptions: Array<EmailOption>;
};

export const createEmailOptions = (
    henkilo: HenkiloState,
    filterKayttooikeusRyhma: (kayttooikeus: MyonnettyKayttooikeusryhma) => boolean,
    kayttooikeusryhmat: Array<MyonnettyKayttooikeusryhma>
): CreateEmailOptions => {
    const emailOptions = parseEmailOptions(henkilo);
    if (emailOptions.length === 1) {
        return {
            emailSelection: kayttooikeusryhmat
                .filter(filterKayttooikeusRyhma)
                .map((uusittavaKayttooikeusRyhma) => emailOptions[0]),
            missingEmail: false,
            showMissingEmailNotification: false,
            emailOptions,
        };
    } else if (emailOptions.length > 1) {
        return {
            missingEmail: false,
            showMissingEmailNotification: false,
            emailOptions,
            emailSelection: kayttooikeusryhmat
                .filter(filterKayttooikeusRyhma)
                .map((uusittavaKayttooikeusRyhma) => ({ value: '' })),
        };
    }
    return {
        missingEmail: true,
        showMissingEmailNotification: true,
        emailOptions,
        emailSelection: kayttooikeusryhmat
            .filter(filterKayttooikeusRyhma)
            .map((uusittavaKayttooikeusRyhma) => ({ value: '' })),
    };
};

const parseEmailOptions = (henkilo: HenkiloState): Array<EmailOption> =>
    (henkilo.henkilo.yhteystiedotRyhma || [])
        .filter((yhteystietoRyhma) => yhteystietoRyhma.ryhmaKuvaus === WORK_ADDRESS)
        .flatMap((yhteystietoRyhma) => yhteystietoRyhma.yhteystieto)
        .filter((yhteystieto) => yhteystieto.yhteystietoTyyppi === EMAIL)
        .map((yhteystieto) => yhteystieto.yhteystietoArvo)
        .filter((value) => !!value)
        .sort((a, b) => a.localeCompare(b))
        .map((email) => ({ value: email, label: email }));
