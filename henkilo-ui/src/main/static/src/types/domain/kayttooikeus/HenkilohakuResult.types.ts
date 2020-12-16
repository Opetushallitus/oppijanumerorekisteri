export type HenkilohakuResult = {
    oidHenkilo: string;
    nimi: string;
    kayttajatunnus: string;
    organisaatioNimiList: Array<OrganisaatioMinimal>;
};

export type OrganisaatioMinimal = {
    identifier: string;
    tyypit: Array<string>;
    localisedLabels: {
        [key: string]: string;
    };
};
