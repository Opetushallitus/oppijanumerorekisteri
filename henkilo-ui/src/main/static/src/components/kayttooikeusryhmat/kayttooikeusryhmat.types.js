// @flow

export type NewKayttooikeusryhmaNimi = {
    fi: string,
    sv: string,
    en: string
}

export type NewKayttoikeusryhmaKuvaus = {
    fi: string,
    sv: string,
    en: string
}

export type NewKayttooikeusryhma = {
    organisaatioSelections: Array<any>,
    name: NewKayttooikeusryhmaNimi,
    description: NewKayttoikeusryhmaKuvaus
}

