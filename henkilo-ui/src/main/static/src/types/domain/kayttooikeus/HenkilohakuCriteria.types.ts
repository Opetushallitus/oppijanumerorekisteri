export type HenkilohakuCriteria = {
    noOrganisation: boolean;
    subOrganisation: boolean;
    passivoitu: boolean;
    duplikaatti: boolean;
    organisaatioOids?: Array<string>;
    kayttooikeusryhmaId?: string;
    nameQuery?: string;
    isCountSearch?: boolean;
};

export type HenkilohakuQueryparameters = {
    offset: string;
    orderBy?: string;
};

export type Henkilohaku = {
    criteria: HenkilohakuCriteria;
    parameters: HenkilohakuQueryparameters;
};
