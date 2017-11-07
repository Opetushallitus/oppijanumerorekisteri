// @flow
export type Organisaatio =  {
    nimi: {en: string, fi: string, sv: string,},
    tyypit: Array<string>,
    oid: string,
    parentOid: ?string,
    parentOidPath: string,
    level: number,
    children: Array<Organisaatio>,
    fullLocalizedName: string,
    parent: Organisaatio,
}

export type OrganisaatioHenkilo = {
    organisaatio: Organisaatio,
};
