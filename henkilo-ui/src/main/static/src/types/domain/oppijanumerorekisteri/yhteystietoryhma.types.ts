import { Yhteystieto } from './yhteystieto.types';

export type YhteystietoRyhma = {
    id?: number;
    henkiloUiId?: string | null | undefined;
    ryhmaKuvaus: string; // Koodisto "yhteystietotyypit"
    ryhmaAlkuperaTieto?: string; // Koodisto "yhteystietojenalkupera"
    yhteystieto: Array<Yhteystieto>;
};
