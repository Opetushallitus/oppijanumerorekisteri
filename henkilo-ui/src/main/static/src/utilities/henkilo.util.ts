import {EmailOption} from "../types/emailoption.type"
import {HenkiloState} from "../reducers/henkilo.reducer"
import PropertySingleton from "../globals/PropertySingleton"
import {MyonnettyKayttooikeusryhma} from "../types/domain/kayttooikeus/kayttooikeusryhma.types"

type CreateEmailOptions = {
    emailSelection: Array<EmailOption>
    missingEmail: boolean
    showMissingEmailNotification: boolean
    emailOptions: Array<EmailOption>
}

export const createEmailOptions = (
    henkilo: HenkiloState,
    filterKayttooikeusRyhma: (
        kayttooikeus: MyonnettyKayttooikeusryhma,
    ) => boolean,
    kayttooikeusryhmat: Array<MyonnettyKayttooikeusryhma>,
): CreateEmailOptions => {
    const emailOptions = parseEmailOptions(henkilo)
    if (emailOptions.length === 1) {
        return {
            emailSelection: kayttooikeusryhmat
                .filter(filterKayttooikeusRyhma)
                .map(uusittavaKayttooikeusRyhma => emailOptions[0]),
            missingEmail: false,
            showMissingEmailNotification: false,
            emailOptions,
        }
    } else if (emailOptions.length > 1) {
        return {
            missingEmail: false,
            showMissingEmailNotification: false,
            emailOptions,
            emailSelection: kayttooikeusryhmat
                .filter(filterKayttooikeusRyhma)
                .map(uusittavaKayttooikeusRyhma => ({value: ""})),
        }
    }
    return {
        missingEmail: true,
        showMissingEmailNotification: true,
        emailOptions,
        emailSelection: kayttooikeusryhmat
            .filter(filterKayttooikeusRyhma)
            .map(uusittavaKayttooikeusRyhma => ({value: ""})),
    }
}

const parseEmailOptions = (henkilo: HenkiloState): Array<any> => {
    let emails = []
    if (henkilo.henkilo.yhteystiedotRyhma) {
        henkilo.henkilo.yhteystiedotRyhma.forEach(yhteystietoRyhma => {
            yhteystietoRyhma.yhteystieto.forEach(yhteys => {
                if (
                    yhteys.yhteystietoTyyppi ===
                    PropertySingleton.getState().SAHKOPOSTI
                ) {
                    emails.push(yhteys.yhteystietoArvo)
                }
            })
        })
    }

    return emails.map(email => ({value: email, label: email}))
}