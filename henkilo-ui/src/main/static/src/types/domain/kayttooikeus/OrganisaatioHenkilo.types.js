// @flow
import type {TextGroup} from "./textgroup.types";

export type Organisaatio = {
    nimi: TextGroup,
    tyypit: Array<string>,
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
