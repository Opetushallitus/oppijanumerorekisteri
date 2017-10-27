// @flow

export type HenkiloCreate = {
    henkiloTyyppi?: string,
    etunimet?: string,
    kutsumanimi?: string,
    sukunimi?: string,
    aidinkieli?: ?Kielisyys,
    kansalaisuus?: ?Array<Kansalaisuus>,
    syntymaaika?: ?string,
    sukupuoli?: ?string,
    passinumerot?: ?Array<string>,
    yhteystiedotRyhma?: ?Array<YhteystietoRyhma>,
};

export type Kielisyys = {
    kieliKoodi: string,
    kieliTyyppi?: ?string,
}

export type Kansalaisuus = {
    kansalaisuusKoodi?: string,
}

export type YhteystietoRyhma = {
    id?: ?number,
    ryhmaKuvaus?: string, // Koodisto "yhteystietotyypit"
    ryhmaAlkuperaTieto?: string, // Koodisto "yhteystietojenalkupera"
    yhteystieto: Array<Yhteystieto>,
}

export type Yhteystieto = {
    yhteystietoTyyppi?: string,
    yhteystietoArvo?: ?string,
}
