export type HenkilohakuCriteria = {
    noOrganisation: boolean;
    subOrganisation: boolean;
    passivoitu: boolean;
    dublicates: boolean;
    organisaatioOids?: Array<string> | string;
    kayttooikeusryhmaId?: string;
    ryhmaOids?: Array<string>;
    nameQuery?: string;
    isCountSearch?: boolean;
};

export type HenkilohakuQueryparameters = {
    offset: number;
    orderBy?: string;
};
