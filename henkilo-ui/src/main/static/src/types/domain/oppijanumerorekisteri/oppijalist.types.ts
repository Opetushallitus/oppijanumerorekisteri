import { YksilointiTila } from './yksilointitila.types';

export type OppijaList = {
    oid: string;
    oppijanumero: string;
    luotu: number;
    muokattu: number;
    syntymaaika: string;
    etunimet: string;
    kutsumanimi: string;
    sukunimi: string;
    yksilointiTila: YksilointiTila;
    serviceUserOid: string;
    serviceUserName: string;
};
