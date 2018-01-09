// @flow

export type KayttoooikeusPerustiedot = {
    oidHenkilo: string,
    organisaatiot: Array<KayttooikeusOrganisaatiot>
}

export type KayttooikeusOrganisaatiot = {|
    +organisaatioOid: string,
    +kayttooikeudet: Array<KayttooikeusOikeudet>
|}

export type KayttooikeusOikeudet = {|
    +palvelu: string,
    +oikeus: string
|}