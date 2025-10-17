import { Yhteystieto } from './yhteystieto.types';

export type YhteystietoRyhma = {
    id?: number | null;
    henkiloUiId?: string;
    ryhmaKuvaus: string; // Koodisto "yhteystietotyypit"
    ryhmaAlkuperaTieto?: string; // Koodisto "yhteystietojenalkupera"
    yhteystieto: Array<Yhteystieto>;
    readOnly?: boolean;
};
