import * as R from 'ramda';

import {KUTSU_ADD_ORGANISAATIO,
    KUTSU_CLEAR_ORGANISAATIOS,
    KUTSU_REMOVE_ORGANISAATIO,
    KUTSU_SET_ORGANISAATIO,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_REQUEST,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_FAILURE,
    KUTSU_ORGANISAATIO_SET_PROPERTIES,
    ADD_ORGANISAATIO_PERMISSION, REMOVE_ORGANISAATIO_PERMISSION} from '../actions/actiontypes';

export const kutsuminenOrganisaatios = (state = [], action) => {
    const newOrganisaatios = state.slice();
    let kutsu;
    switch (action.type) {
        case KUTSU_ADD_ORGANISAATIO:
            newOrganisaatios.push(action.organisaatio);
            return newOrganisaatios;
        case KUTSU_SET_ORGANISAATIO:
            const properties = {
                oid: action.organisaatio.oid,
                organisation: action.organisaatio,
                selectablePermissions: [],
                selectedPermissions: [],
                permissionFetched: false,
            }
            newOrganisaatios[action.index] = { ...newOrganisaatios[action.index], ...properties };
            return newOrganisaatios;
        case KUTSU_REMOVE_ORGANISAATIO:
            return R.reject( organisaatio => organisaatio.oid === action.organisaatioOid, newOrganisaatios );
        case KUTSU_CLEAR_ORGANISAATIOS:
            return [];
        case FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_REQUEST:
            kutsu = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsu.permissionFetched = false;
            return newOrganisaatios;
        case FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS:
            kutsu = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsu.selectablePermissions = action.kayttooikeusryhmat;
            kutsu.permissionFetched = true;
            return newOrganisaatios;
        case FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_FAILURE:
            kutsu = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsu.permissionFetched = true;
            return newOrganisaatios;
        case KUTSU_ORGANISAATIO_SET_PROPERTIES:
            newOrganisaatios[action.index] = { ...newOrganisaatios[action.index], ...action.properties }
            return newOrganisaatios
        case ADD_ORGANISAATIO_PERMISSION:
            kutsu = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsu.selectedPermissions.push(action.permission);
            kutsu.selectablePermissions = R.reject( (selectablePermission) => selectablePermission.ryhmaId === action.permission.ryhmaId, kutsu.selectablePermissions );
            return newOrganisaatios;
        case REMOVE_ORGANISAATIO_PERMISSION:
            kutsu = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsu.selectedPermissions = R.reject( (selectedPermission) => selectedPermission.ryhmaId === action.permission.ryhmaId, kutsu.selectedPermissions );
            kutsu.selectablePermissions.push(action.permission);
            return newOrganisaatios;
        default:
            return state;
    }

};