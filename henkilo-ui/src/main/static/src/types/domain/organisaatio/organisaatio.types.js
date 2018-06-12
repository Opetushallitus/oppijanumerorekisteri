// @flow

export type OrganisaatioHakuTulos = {
    numHits: number,
    organisaatiot: Array<Organisaatio>
}

export type Organisaatio = {
    oid: string,
    alkuPvm: string,
    lakkautusPvm: string,
    parentOid: string,
    parentOidPath: string,
    ytunnus: string,
    oppilaitosKoodi: string,
    oppilaitostyyppi: string,
    toimipistekoodi: string,
    match: boolean,
    nimi: {
        fi?: string,
        sv?: string,
        en?: string
    },
    kieletUris: Array<string>,
    kotipaikkaUri: string,
    children: Array<Organisaatio>,
    aliOrganisaatioMaara: number,
    virastoTunnus: string,
    organisaatiotyypit: Array<string>,
    status: string
}

export type Ryhma = {
    oid: string,
    nimi: {[string]: string},
    version: number,
    parentOid: string,
    parentOidPath: string,
    alkuPvm: string,
    lakkautusPvm: string,
    kuvaus: {[string]: string},
    ryhmatyypit: Array<string>,
    kayttoryhmat: Array<string>
}