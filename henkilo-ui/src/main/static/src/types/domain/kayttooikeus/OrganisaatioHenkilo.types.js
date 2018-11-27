// @flow
import type {TextGroup} from "./textgroup.types";
import type {AllowedKayttooikeus} from "../../../reducers/kayttooikeusryhma.reducer";

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
    voimassaLoppuPvm: ?string,
    selectablePermissions: AllowedKayttooikeus,
    selectedPermissions: AllowedKayttooikeus,
    isPermissionsLoading: boolean,
};
