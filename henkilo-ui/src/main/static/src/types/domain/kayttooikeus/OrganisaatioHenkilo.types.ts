import {AllowedKayttooikeus} from "../../../reducers/kayttooikeusryhma.reducer"
import {OrganisaatioWithChildren} from "../organisaatio/organisaatio.types"

export type OrganisaatioHenkilo = {
    organisaatio: OrganisaatioWithChildren
}

export type KutsuOrganisaatio = {
    oid: string
    organisation: {oid: string}
    voimassaLoppuPvm: string | null | undefined
    selectablePermissions: AllowedKayttooikeus
    selectedPermissions: AllowedKayttooikeus
    isPermissionsLoading: boolean
}
