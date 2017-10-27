// @flow

export type Kayttooikeusryhma = {
    id: number,
    tunniste: string,
    nimi: TextGroup,
    kuvaus: ?TextGroup,
    organisaatioViite: Array<OrganisaatioViite>,
}

type TextGroup = {
    texts: Array<Text>,
}
type Text = {
    lang: string,
    text: string,
}

export type OrganisaatioViite = {
    id: number,
    organisaatioTyyppi: string,
}
