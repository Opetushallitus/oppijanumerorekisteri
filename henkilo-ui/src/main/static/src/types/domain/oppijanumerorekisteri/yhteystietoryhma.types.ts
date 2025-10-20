import { Yhteystieto } from './yhteystieto.types';

export type YhteystietoRyhma = {
    id?: number | null;
    ryhmaKuvaus: string; // Koodisto "yhteystietotyypit"
    ryhmaAlkuperaTieto?: string; // Koodisto "yhteystietojenalkupera"
    yhteystieto: Array<Yhteystieto>;
    readOnly?: boolean;
};
