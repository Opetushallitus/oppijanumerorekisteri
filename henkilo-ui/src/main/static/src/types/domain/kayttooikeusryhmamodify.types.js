// @flow

import type {TextGroup} from "./textgroup.types";

export type KayttooikeusRyhmaModify = {
    nimi: TextGroup,
    kuvaus: TextGroup,
    palvelutRoolit: any,
    organisaatioTyypit: Array<string>,
    rooliRajoite: string,
    slaveIds: Array<number>
}