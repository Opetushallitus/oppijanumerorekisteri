export type KayttooikeusOrganisaatiot = {
    readonly organisaatioOid: string;
    readonly kayttooikeudet: KayttooikeusOikeudet[];
};

export type KayttooikeusOikeudet = {
    readonly palvelu: string;
    readonly oikeus: string;
};
