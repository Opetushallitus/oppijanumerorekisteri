// @flow

import type {YksilointiTila} from "./yksilointitila.types";

export type OppijaList = {
    oid: string,
    oppijanumero: string,
    luotu: string,
    muokattu: string,
    hetu: string,
    syntymaaika: string,
    etunimet: string,
    kutsumanimi: string,
    sukunimi: string,
    yksilointiTila: YksilointiTila
}