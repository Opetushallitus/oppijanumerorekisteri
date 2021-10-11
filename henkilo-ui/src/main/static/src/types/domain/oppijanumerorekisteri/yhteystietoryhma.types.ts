import { Yhteystieto } from './yhteystieto.types';

export const WORK_ADDRESS = 'yhteystietotyyppi2'; // refers to koodisto (yhteystietotyypit)

export type YhteystietoRyhma = {
    id?: number;
    henkiloUiId?: string | null | undefined;
    ryhmaKuvaus: string; // Koodisto "yhteystietotyypit"
    ryhmaAlkuperaTieto?: string; // Koodisto "yhteystietojenalkupera"
    yhteystieto: Array<Yhteystieto>;
};
