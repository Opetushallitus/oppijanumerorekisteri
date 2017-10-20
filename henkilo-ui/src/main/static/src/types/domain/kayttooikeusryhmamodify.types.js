// @flow

import type {TextGroup} from "./textgroup.types";
import type {PalveluRooliModify} from "./PalveluRooliModify";

export type KayttooikeusRyhmaModify = {
    nimi: TextGroup,
    kuvaus: TextGroup,
    palvelutRoolit: Array<PalveluRooliModify>,
    organisaatioTyypit: Array<string>,
    rooliRajoite: string,
    slaveIds: Array<number>
}