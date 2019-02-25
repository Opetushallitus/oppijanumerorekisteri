// @flow

import type {TextGroup} from "./textgroup.types";
import type {PalveluRooliModify} from "./PalveluRooliModify.types";
import type {OrganisaatioViite} from "./organisaatioviite.types";
import type {KayttoOikeudenTila} from "./KayttoOikeudenTila.types";
import type {SallitutKayttajatyypit} from "../../../components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage";

export type Kayttooikeusryhma = {
    id: number,
    tunniste: string,
    nimi: TextGroup,
    kuvaus: ?TextGroup,
    organisaatioViite: Array<OrganisaatioViite>,
    rooliRajoite?: string,
    passivoitu?: boolean,
    ryhmaRestriction?: boolean,
    sallittuKayttajatyyppi: ?SallitutKayttajatyypit,
    description: ?TextGroup, // Tämä puuttuu MyonnettyKayttooikeusryhma tyypistä
}

export type KayttooikeusRyhmaModify = {
    nimi: TextGroup,
    kuvaus: TextGroup,
    palvelutRoolit: Array<PalveluRooliModify>,
    organisaatioTyypit: Array<string>,
    rooliRajoite: string,
    slaveIds: Array<number>,
    passivoitu: boolean,
    ryhmaRestriction: boolean
}

export type MyonnettyKayttooikeusryhma = {
    ryhmaId: number,
    ryhmaTunniste: string,
    ryhmaNames: TextGroup,
    organisaatioOid: string,
    ryhmaKuvaus: ?TextGroup,
    myonnettyTapahtumaId: ?number,
    alkuPvm: ?string,
    voimassaPvm: ?string,
    tila: KayttoOikeudenTila,
    kasitelty: string,
    kasittelijaOid: string,
    kasittelijaNimi: string,
    tehtavanimike: string,
    tyyppi: string,
    removed: boolean,
    selected: boolean,
    muutosSyy: string,
    sallittuKayttajatyyppi: ?SallitutKayttajatyypit,
}
