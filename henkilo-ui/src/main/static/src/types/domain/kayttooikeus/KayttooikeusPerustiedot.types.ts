export type KayttoooikeusPerustiedot = {
    oidHenkilo: string;
    organisaatiot: Array<KayttooikeusOrganisaatiot>;
};

export type KayttooikeusOrganisaatiot = {
    readonly organisaatioOid: string;
    readonly kayttooikeudet: Array<KayttooikeusOikeudet>;
};

export type KayttooikeusOikeudet = {
    readonly palvelu: string;
    readonly oikeus: string;
};
