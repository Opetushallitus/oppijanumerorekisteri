// @flow
import type {TextGroup} from "./textgroup.types";
import type {AllowedKayttooikeus} from "../../../reducers/kayttooikeusryhma.reducer";
import type {OrganisaatioWithChildren} from '../organisaatio/organisaatio.types';

export type OrganisaatioHenkilo = {
    organisaatio: OrganisaatioWithChildren,
};

export type KutsuOrganisaatio = {
    oid: string,
    organisation: {oid: string},
    voimassaLoppuPvm: ?string,
    selectablePermissions: AllowedKayttooikeus,
    selectedPermissions: AllowedKayttooikeus,
    isPermissionsLoading: boolean,
};
