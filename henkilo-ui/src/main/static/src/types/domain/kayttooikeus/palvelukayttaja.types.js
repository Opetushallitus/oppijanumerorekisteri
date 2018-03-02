// @flow

export type PalvelukayttajaCreate = {
    nimi: string,
}

export type PalvelukayttajaRead = {
    oid: string,
    nimi: string,
    kayttajatunnus: ?string,
}

export type PalvelukayttajaCriteria = {
    subOrganisation: boolean,
    passivoitu: boolean,
    nameQuery: string,
}
