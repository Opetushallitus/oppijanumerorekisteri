// @flow
import type { MyonnettyKayttooikeusryhma, Kayttooikeusryhma } from '../types/domain/kayttooikeus/kayttooikeusryhma.types'

export function myonnettyToKayttooikeusryhma(myonnetty: MyonnettyKayttooikeusryhma): Kayttooikeusryhma {
    return {
        id: myonnetty.ryhmaId,
        tunniste: myonnetty.ryhmaTunniste,
        nimi: myonnetty.ryhmaNames,
        kuvaus: myonnetty.ryhmaKuvaus,
        organisaatioViite: []
    }
}
