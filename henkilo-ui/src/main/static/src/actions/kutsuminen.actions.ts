import { AppDispatch } from '../store';
import {
    KUTSU_SET_ORGANISAATIO,
    KUTSU_ADD_ORGANISAATIO,
    KUTSU_REMOVE_ORGANISAATIO,
    KUTSU_CLEAR_ORGANISAATIOS,
    KUTSU_ORGANISAATIO_SET_PROPERTIES,
    ADD_ORGANISAATIO_PERMISSION,
    REMOVE_ORGANISAATIO_PERMISSION,
} from './actiontypes';

export const kutsuSetOrganisaatio = (index, organisaatio) => (dispatch: AppDispatch) =>
    dispatch({ type: KUTSU_SET_ORGANISAATIO, index, organisaatio });
export const kutsuAddOrganisaatio = (organisaatio) => (dispatch: AppDispatch) =>
    dispatch({ type: KUTSU_ADD_ORGANISAATIO, organisaatio });
export const kutsuRemoveOrganisaatio = (index) => (dispatch: AppDispatch) =>
    dispatch({ type: KUTSU_REMOVE_ORGANISAATIO, index });
export const kutsuClearOrganisaatios = () => (dispatch: AppDispatch) => dispatch({ type: KUTSU_CLEAR_ORGANISAATIOS });

export const addOrganisaatioPermission = (organisaatioOid, permission) => (dispatch: AppDispatch) =>
    dispatch({ type: ADD_ORGANISAATIO_PERMISSION, organisaatioOid, permission });

export const removeOrganisaatioPermission = (organisaatioOid, permission) => (dispatch: AppDispatch) =>
    dispatch({
        type: REMOVE_ORGANISAATIO_PERMISSION,
        organisaatioOid,
        permission,
    });

export const kutsuOrganisaatioSetProperties = (index, properties) => (dispatch: AppDispatch) =>
    dispatch({ type: KUTSU_ORGANISAATIO_SET_PROPERTIES, index, properties });
