import { YhteystietoRyhma } from './yhteystietoryhma.types';

export type Yksilointitieto = {
    etunimet?: string;
    sukunimi?: string;
    kutsumanimi?: string;
    sukupuoli?: string;
    yhteystiedot?: YhteystietoRyhma[];
};
