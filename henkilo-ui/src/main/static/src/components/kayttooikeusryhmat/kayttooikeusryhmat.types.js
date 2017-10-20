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

export type NewKayttooikeusryhma = {
    organisaatioSelections: Array<ReactSelectOption>,
    oppilaitostyypitSelections: Array<ReactSelectOption>,
    kayttooikeusryhmaSelections: Array<ReactSelectOption>,
    kayttooikeudetSelections: Array<ReactSelectOption>,
    name: NewKayttooikeusryhmaNimi,
    description: NewKayttoikeusryhmaKuvaus
}

