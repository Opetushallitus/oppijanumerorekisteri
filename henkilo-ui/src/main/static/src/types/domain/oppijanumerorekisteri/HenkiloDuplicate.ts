import { Kielisyys } from './kielisyys.types';

export type HenkiloDuplicate = {
    oidHenkilo: string;
    etunimet: string;
    kutsumanimi: string;
    sukunimi: string;
    sukupuoli: string;
    hetu: string;
    syntymaaika: string;
    passivoitu: boolean;
    email: string;
    yksiloity: boolean;
    aidinkieli: Kielisyys;
    asiointiKieli: Kielisyys;
    hakemukset: Array<any>;
};
