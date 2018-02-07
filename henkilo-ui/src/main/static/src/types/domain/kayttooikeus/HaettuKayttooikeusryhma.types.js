// @flow

import type {Anomus} from "./Anomus.types";
import type {KayttoOikeudenTila} from "./KayttoOikeudenTila.types";
import type {Kayttooikeusryhma} from "./kayttooikeusryhma.types";

export type HaettuKayttooikeusryhma = {
    id: number,
    anomus: Anomus,
    kayttoOikeusRyhma: Kayttooikeusryhma,
    kasittelyPvm: string,
    tyyppi: KayttoOikeudenTila
}