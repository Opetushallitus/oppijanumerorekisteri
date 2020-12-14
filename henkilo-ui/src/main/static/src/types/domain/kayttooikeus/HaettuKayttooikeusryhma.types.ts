import {Anomus} from "./Anomus.types"
import {KayttoOikeudenTila} from "./KayttoOikeudenTila.types"
import {Kayttooikeusryhma} from "./kayttooikeusryhma.types"

export type HaettuKayttooikeusryhma = {
    id: number
    anomus: Anomus
    kayttoOikeusRyhma: Kayttooikeusryhma
    kasittelyPvm: string
    tyyppi: KayttoOikeudenTila
}