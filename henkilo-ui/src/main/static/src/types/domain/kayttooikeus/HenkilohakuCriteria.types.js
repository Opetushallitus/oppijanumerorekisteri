// @flow

export type HenkilohakuCriteria = {
    noOrganisation: boolean,
    subOrganisation: boolean,
    passivoitu: boolean,
    dublicates: boolean,
    organisaatioOids?: Array<string>,
    kayttooikeusryhmaId?: string,
    ryhmaOids?: Array<string>,
    nameQuery?: string,
}

export type HenkilohakuQueryparameters = {
    offset: number,
    orderBy?: string
}