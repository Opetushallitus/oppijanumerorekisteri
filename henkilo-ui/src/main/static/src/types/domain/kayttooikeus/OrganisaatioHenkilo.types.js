// @flow
import type {TextGroup} from "./textgroup.types";
import type { MyonnettyKayttooikeusryhma } from "./kayttooikeusryhma.types"

export type Organisaatio = {
    nimi: TextGroup,
    tyypit: Array<string>,
    organisaatiotyypit: Array<string>, // It is unclear which api returns this
    oid: string,
    parentOid: ?string,
    parentOidPath: string,
    level: number,
    children: Array<Organisaatio>,
    fullLocalizedName: string,
    parent: Organisaatio,
}

export type OrganisaatioHenkilo = {
    organisaatio: Organisaatio,
};

export type KutsuOrganisaatio = {
    oid: string,
    organisation: {oid: string},
    selectablePermissions: Array<MyonnettyKayttooikeusryhma>,
    selectedPermissions: Array<MyonnettyKayttooikeusryhma>,
};
