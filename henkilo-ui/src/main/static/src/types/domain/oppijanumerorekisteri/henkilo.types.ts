import { YhteystietoRyhma } from './yhteystietoryhma.types';
import { Kansalaisuus } from './kansalaisuus.types';
import { Kielisyys } from './kielisyys.types';
import Moment from 'moment';

export type Yksilointivirhe = {
    uudelleenyritysAikaleima?: Moment.Moment;
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
    kielisyys: Array<Kielisyys>;
    kansalaisuus: Array<Kansalaisuus>;
    kasittelijaOid: string;
    syntymaaika: string;
    sukupuoli: '1' | '2';
    oppijanumero: string;
    turvakielto: boolean;
    eiSuomalaistaHetua: boolean;
    yksiloity: boolean;
    yksiloityVTJ: boolean;
    yksiloityEidas: boolean;
    yksilointiYritetty: boolean;
    duplicate: boolean;
    created: number;
    modified: number;
    vtjsynced: number;
    huoltaja: Henkilo;
    yhteystiedotRyhma: Array<YhteystietoRyhma>;
    yksilointivirheet: Array<Yksilointivirhe>;
    anomusilmoitus?: number[];
    kayttajanimi?: string;
};

export type LinkedHenkilo = Henkilo & { id: string };

export type HenkiloCreate = {
    etunimet?: string;
    kutsumanimi?: string;
    sukunimi?: string;
    aidinkieli?: Kielisyys;
    kansalaisuus?: Array<Kansalaisuus>;
    syntymaaika?: string;
    sukupuoli?: '1' | '2';
    passinumerot?: Array<string>;
    yhteystiedotRyhma?: Array<YhteystietoRyhma>;
    yksiloity?: boolean;
};

export type HenkiloOrg = {
    id: number;
    organisaatioOid: string;
    organisaatioHenkiloTyyppi: string | null;
    tehtavanimike: string;
    passivoitu: boolean;
    voimassaAlkuPvm: string | null;
    voimassaLoppuPvm: string | null;
};
