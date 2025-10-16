import { Locale } from '../../locale.type';

export type HenkilohakuResult = {
    oidHenkilo: string;
    nimi: string;
    kayttajatunnus: string;
    organisaatioNimiList: Array<OrganisaatioMinimal>;
};

export type OrganisaatioMinimal = {
    identifier: string;
    tyypit: Array<string>;
    localisedLabels: Record<Locale, string>;
};
