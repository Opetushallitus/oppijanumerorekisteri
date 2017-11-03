// @flow

import type {Kielisyys, YhteystietoRyhma} from "../henkilo.type";

export type Henkilo = {
    oidHenkilo: string,
    hetu: string,
    pasivoitu: boolean,
    henkiloTyyppi: 'OPPIJA' | 'VIRKAILIJA' | 'PALVELU',
    etunimet: string,
    kutsumanimi: string,
    sukunimi: string,
    aidinkieli: Kielisyys,
    asiointiKieli: Kielisyys,
    kielisyys: Array<Kielisyys>,
    kansalaisuus: Array<Kielisyys>,
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