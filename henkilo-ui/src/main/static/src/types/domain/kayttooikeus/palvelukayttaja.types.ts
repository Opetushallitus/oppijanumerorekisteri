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
    passivoitu: string;
    nameQuery: string;
    selection?: string;
};
