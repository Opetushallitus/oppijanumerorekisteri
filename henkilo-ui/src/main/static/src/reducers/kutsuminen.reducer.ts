import {find, propEq, reject} from "ramda"

import {
    KUTSU_ADD_ORGANISAATIO,
    KUTSU_CLEAR_ORGANISAATIOS,
    KUTSU_REMOVE_ORGANISAATIO,
    KUTSU_SET_ORGANISAATIO,
    KUTSU_ORGANISAATIO_SET_PROPERTIES,
    ADD_ORGANISAATIO_PERMISSION,
    REMOVE_ORGANISAATIO_PERMISSION,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS,
    FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE,
} from "../actions/actiontypes"
import {KutsuOrganisaatio} from "../types/domain/kayttooikeus/OrganisaatioHenkilo.types"

export const kutsuminenOrganisaatios = (
    state: Array<KutsuOrganisaatio> = [],
    action: any,
): Array<KutsuOrganisaatio> => {
    const newOrganisaatios = [...state]
    let kutsu: KutsuOrganisaatio | null | undefined
    switch (action.type) {
        case KUTSU_ADD_ORGANISAATIO:
            newOrganisaatios.push(action.organisaatio)
            return newOrganisaatios
        case KUTSU_SET_ORGANISAATIO:
            const properties = {
                oid: action.organisaatio.oid,
                organisation: action.organisaatio,
                selectablePermissions: [],
                selectedPermissions: [],
                isPermissionsLoading: false,
            }
            newOrganisaatios[action.index] = {
                ...newOrganisaatios[action.index],
                ...properties,
            }
            return newOrganisaatios
        case KUTSU_REMOVE_ORGANISAATIO:
            return reject(
                organisaatio => organisaatio.oid === action.organisaatioOid,
                newOrganisaatios,
            )
        case KUTSU_CLEAR_ORGANISAATIOS:
            return []
        case FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_REQUEST:
            const propeq = propEq("oid", action.oidOrganisation)
            kutsu = find(propeq)(newOrganisaatios)

            if (kutsu) {
                kutsu.isPermissionsLoading = true
            }

            return newOrganisaatios
        case FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_SUCCESS:
            kutsu = find(propEq("oid", action.oidOrganisation))(
                newOrganisaatios,
            )

            if (kutsu) {
                kutsu.selectablePermissions = action.allowedKayttooikeus
                kutsu.isPermissionsLoading = false
            }

            return newOrganisaatios
        case FETCH_ALLOWED_KAYTTOOIKEUS_FOR_ORGANISATION_FAILURE:
            kutsu = find(propEq("oid", action.oidOrganisation))(
                newOrganisaatios,
            )

            if (kutsu) {
                kutsu.isPermissionsLoading = false
            }

            return newOrganisaatios
        case KUTSU_ORGANISAATIO_SET_PROPERTIES:
            newOrganisaatios[action.index] = {
                ...newOrganisaatios[action.index],
                ...action.properties,
            }
            return newOrganisaatios
        case ADD_ORGANISAATIO_PERMISSION:
            kutsu = find(propEq("oid", action.organisaatioOid))(
                newOrganisaatios,
            )

            if (kutsu) {
                kutsu.selectedPermissions.push(action.permission)
                kutsu.selectablePermissions = reject(
                    selectablePermission =>
                        selectablePermission.ryhmaId ===
                        action.permission.ryhmaId,
                    kutsu.selectablePermissions,
                )
            }

            return newOrganisaatios
        case REMOVE_ORGANISAATIO_PERMISSION:
            kutsu = find(propEq("oid", action.organisaatioOid))(
                newOrganisaatios,
            )

            if (kutsu) {
                kutsu.selectedPermissions = reject(
                    selectedPermission =>
                        selectedPermission.ryhmaId ===
                        action.permission.ryhmaId,
                    kutsu.selectedPermissions,
                )
                kutsu.selectablePermissions.push(action.permission)
            }

            return newOrganisaatios
        default:
            return state
    }
}