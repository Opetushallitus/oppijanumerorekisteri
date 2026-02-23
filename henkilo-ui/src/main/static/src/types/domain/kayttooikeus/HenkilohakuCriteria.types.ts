export type HenkilohakuCriteria = {
    noOrganisation: boolean;
    subOrganisation: boolean;
    passivoitu: boolean;
    duplikaatti: boolean;
    organisaatioOids?: string[];
    kayttooikeusryhmaId?: string;
    nameQuery?: string;
    isCountSearch?: boolean;
};

export type HenkilohakuQueryparameters = {
    orderBy?: string;
};

export type Henkilohaku = {
    criteria: HenkilohakuCriteria;
    parameters: HenkilohakuQueryparameters;
};
