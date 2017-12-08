// @flow

import type {YhteystietoRyhma} from "./yhteystietoryhma.types";
import type {Kansalaisuus} from "./kansalaisuus.types";
import type {Kielisyys} from "./kielisyys.types";

export type Henkilo = {
    oidHenkilo: string,
    hetu: string,
    passivoitu: boolean,
    henkiloTyyppi: 'OPPIJA' | 'VIRKAILIJA' | 'PALVELU',
    etunimet: string,
    kutsumanimi: string,
    sukunimi: string,
    aidinkieli: Kielisyys,
    asiointiKieli: Kielisyys,
    kielisyys: Array<Kielisyys>,
    kansalaisuus: Array<Kansalaisuus>,
    kasittelijaOid: string,
    syntymaaika: string,
    sukupuoli: string,
    oppijanumero: string,
    turvakielto: boolean,
    eiSuomalaistaHetua: boolean,
    yksiloity: boolean,
    yksiloityVTJ: boolean,
    yksilointiYritetty: boolean,
    duplicate: boolean,
    created: number,
    modified: number,
    vtjsynced: number,
    huoltaja: Henkilo,
    yhteystiedotRyhma: Array<YhteystietoRyhma>
}

export type HenkiloCreate = {
    henkiloTyyppi?: string,
    etunimet?: string,
    kutsumanimi?: string,
    sukunimi?: string,
    aidinkieli?: ?Kielisyys,
    kansalaisuus?: ?Array<Kansalaisuus>,
    syntymaaika?: ?string,
    sukupuoli?: ?string,
    passinumerot?: ?Array<string>,
    yhteystiedotRyhma?: ?Array<YhteystietoRyhma>,
};
