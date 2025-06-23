export type PalvelukayttajaCreate = {
    nimi: string;
};

export type PalvelukayttajaRead = {
    oid: string;
    nimi: string;
    kayttajatunnus: string | null | undefined;
};

export type Jarjestelmatunnus = {
    oid: string;
    nimi: string;
    kayttajatunnus: string | null | undefined;
    oauth2Credentials: Oauth2ClientCredential[] | null;
};

export type Oauth2ClientCredential = {
    clientId: string;
    created: string;
    updated: string;
    kasittelija: Kasittelija;
};

export type Kasittelija = {
    oid: string;
    sukunimi: string;
    etunimet: string;
    kutsumanimi: string;
};

export type PalvelukayttajaCriteria = {
    subOrganisation: string;
    nameQuery: string;
    organisaatioOid?: string;
};
