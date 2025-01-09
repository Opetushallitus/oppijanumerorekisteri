export type Hakemus = {
    hakemusData: AtaruHakemus | HakuAppHakemus;
};

export type AtaruHakemus = {
    aidinkieli: string;
    email: string;
    form: string;
    haku: string;
    henkiloOid: string;
    idTunnus: string | null;
    kansalaisuus: string[];
    lahiosoite: string;
    matkapuhelin: string;
    oid: string;
    passinNumero: string | null;
    postinumero: string;
    service: string;
};

export type HakuAppHakemus = {
    oid?: string;
    personOid?: string;
    state?: string;
    service?: string;
    answers?: {
        henkilotiedot?: {
            aidinkieli?: string;
            kansalaisuus?: string;
            matkapuhelinnumero1?: string;
            Sähköposti?: string;
            lahiosoite?: string;
            Postinumero?: string;
            passinumero?: string;
            kansallinenIdTunnus?: string;
        };
    };
};
