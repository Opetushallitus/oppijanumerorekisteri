import { Yhteystieto } from './yhteystieto.types';

export type YhteystietoRyhma = {
    id?: number | null | undefined;
    henkiloUiId?: string | null | undefined;
    ryhmaKuvaus?: string; // Koodisto "yhteystietotyypit"
    ryhmaAlkuperaTieto?: string; // Koodisto "yhteystietojenalkupera"
    yhteystieto: Array<Yhteystieto>;
};
