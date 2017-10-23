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

export type PalveluJaKayttooikeusSelection = {
    palvelu: ReactSelectOption,
    kayttooikeus: ReactSelectOption
}

export type NewKayttooikeusryhma = {
    name: NewKayttooikeusryhmaNimi,
    description: NewKayttoikeusryhmaKuvaus,
    ryhmaRajoite: boolean,
    organisaatioSelections: Array<ReactSelectOption>,
    oppilaitostyypitSelections: Array<ReactSelectOption>,
    kayttooikeusryhmaSelections: Array<ReactSelectOption>,
    palveluJaKayttooikeusSelections: Array<PalveluJaKayttooikeusSelection>,
}

