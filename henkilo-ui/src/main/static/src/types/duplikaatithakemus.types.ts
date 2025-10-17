export type DuplikaatitHakemus = {
    oid?: string;
    hakijaOid?: string;
    kansalaisuus?: string;
    aidinkieli?: string;
    matkapuhelinnumero?: string;
    sahkoposti?: string;
    lahiosoite?: string;
    postinumero?: string;
    passinumero?: string | null;
    kansallinenIdTunnus?: string | null;
    href: string;
    state?: string | null;
};
