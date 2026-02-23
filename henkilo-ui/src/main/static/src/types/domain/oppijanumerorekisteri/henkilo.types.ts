import { YhteystietoRyhma } from './yhteystietoryhma.types';
import { Kansalaisuus } from './kansalaisuus.types';
import { Kielisyys } from './kielisyys.types';

export type Yksilointivirhe = {
    uudelleenyritysAikaleima?: number;
    yksilointivirheTila: 'HETU_EI_OIKEA' | 'HETU_EI_VTJ' | 'MUU_UUDELLEENYRITETTAVA' | 'MUU';
};

export type Henkilo = {
    oidHenkilo: string;
    hetu: string;
    passivoitu: boolean;
    etunimet: string;
    kutsumanimi: string;
    sukunimi: string;
    aidinkieli: Kielisyys;
    asiointiKieli: Kielisyys;
    kielisyys: Kielisyys[];
    kansalaisuus: Kansalaisuus[];
    kasittelijaOid: string;
    syntymaaika: string;
    sukupuoli: '1' | '2';
    oppijanumero: string;
    turvakielto: boolean;
    eiSuomalaistaHetua: boolean;
    yksiloity: boolean;
    yksiloityVTJ: boolean;
    yksilointiYritetty: boolean;
    yksiloityEidas: boolean;
    eidasTunnisteet: EidasTunniste[];
    duplicate: boolean;
    created: number;
    modified: number;
    vtjsynced: number;
    huoltaja: Henkilo;
    yhteystiedotRyhma: YhteystietoRyhma[];
    yksilointivirheet: Yksilointivirhe[];
    anomusilmoitus?: number[];
    kayttajanimi?: string;
};

export type EidasTunniste = {
    tunniste: string;
};

export type LinkedHenkilo = Henkilo & { id: string };

export type HenkiloCreate = {
    etunimet?: string;
    kutsumanimi?: string;
    sukunimi?: string;
    aidinkieli?: Kielisyys;
    kansalaisuus?: Kansalaisuus[];
    syntymaaika?: string;
    sukupuoli?: '1' | '2';
    passinumerot: string[] | null;
    yhteystiedotRyhma: YhteystietoRyhma[] | null;
    yksiloity?: boolean;
};

export type HenkiloOrg = {
    id: number;
    organisaatioOid: string;
    passivoitu: boolean;
};
