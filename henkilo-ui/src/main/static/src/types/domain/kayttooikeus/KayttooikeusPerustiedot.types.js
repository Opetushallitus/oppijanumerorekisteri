// @flow

export type KayttooikeusOrganisaatiot = {|
    +organisaatioOid: string,
    +kayttooikeudet: Array<KayttooikeusOikeudet>
|}

export type KayttooikeusOikeudet = {|
    +palvelu: string,
    +oikeus: string
|}