import { Locale } from '../../locale.type';

export type HenkilohakuResult = {
    oidHenkilo: string;
    nimi: string;
    kayttajatunnus: string;
    organisaatioNimiList: OrganisaatioMinimal[];
};

export type OrganisaatioMinimal = {
    identifier: string;
    tyypit: string[];
    localisedLabels: Record<Locale, string>;
};
