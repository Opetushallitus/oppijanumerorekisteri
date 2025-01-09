export type PalvelukayttajaCreate = {
    nimi: string;
};

export type PalvelukayttajaRead = {
    oid: string;
    nimi: string;
    kayttajatunnus: string | null | undefined;
};

export type PalvelukayttajaCriteria = {
    subOrganisation: string;
    nameQuery: string;
    organisaatioOid?: string;
};
