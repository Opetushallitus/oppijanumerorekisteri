// @flow

import type {ReactSelectOption} from "../../types/react-select.types";

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

export type KayttooikeusSelection = {
    palvelu: ReactSelectOption,
    kayttooikeus: ReactSelectOption
}

export type NewKayttooikeusryhma = {
    organisaatioSelections: Array<ReactSelectOption>,
    oppilaitostyypitSelections: Array<ReactSelectOption>,
    kayttooikeusryhmaSelections: Array<ReactSelectOption>,
    palveluJaKayttooikeusSelections: Array<KayttooikeusSelection>,
    name: NewKayttooikeusryhmaNimi,
    description: NewKayttoikeusryhmaKuvaus
}

