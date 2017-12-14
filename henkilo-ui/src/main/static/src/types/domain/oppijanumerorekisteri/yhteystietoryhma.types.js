// @flow

import type {Yhteystieto} from "./yhteystieto.types";

export type YhteystietoRyhma = {
    id?: ?number,
    henkiloUiId?: ?string,
    ryhmaKuvaus?: string, // Koodisto "yhteystietotyypit"
    ryhmaAlkuperaTieto?: string, // Koodisto "yhteystietojenalkupera"
    yhteystieto: Array<Yhteystieto>,
}