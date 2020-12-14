import {
    KUTSU_SET_ORGANISAATIO,
    KUTSU_ADD_ORGANISAATIO,
    KUTSU_REMOVE_ORGANISAATIO,
    KUTSU_CLEAR_ORGANISAATIOS,
    KUTSU_ORGANISAATIO_SET_PROPERTIES,
    ADD_ORGANISAATIO_PERMISSION,
    REMOVE_ORGANISAATIO_PERMISSION,
} from "./actiontypes"

export const kutsuSetOrganisaatio = (index, organisaatio) => dispatch =>
    dispatch({type: KUTSU_SET_ORGANISAATIO, index, organisaatio})
export const kutsuAddOrganisaatio = organisaatio => dispatch =>
    dispatch({type: KUTSU_ADD_ORGANISAATIO, organisaatio})
export const kutsuRemoveOrganisaatio = organisaatioOid => dispatch =>
    dispatch({type: KUTSU_REMOVE_ORGANISAATIO, organisaatioOid})
export const kutsuClearOrganisaatios = () => dispatch =>
    dispatch({type: KUTSU_CLEAR_ORGANISAATIOS})

export const addOrganisaatioPermission = (
    organisaatioOid,
    permission,
) => dispatch =>
    dispatch({type: ADD_ORGANISAATIO_PERMISSION, organisaatioOid, permission})

export const removeOrganisaatioPermission = (
    organisaatioOid,
    permission,
) => dispatch =>
    dispatch({
        type: REMOVE_ORGANISAATIO_PERMISSION,
        organisaatioOid,
        permission,
    })

export const kutsuOrganisaatioSetProperties = (index, properties) => dispatch =>
    dispatch({type: KUTSU_ORGANISAATIO_SET_PROPERTIES, index, properties})