import R from 'ramda';

import {KUTSU_ADD_ORGANISAATIO,
    KUTSU_CLEAR_ORGANISAATIOS,
    KUTSU_REMOVE_ORGANISAATIO,
    KUTSU_SET_ORGANISAATIO,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_REQUEST,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS,
    FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_FAILURE
    } from '../actions/actiontypes';

export const virkailijaInvitationOrganisaatios = (state = [], action) => {
    const newOrganisaatios = state.slice();

    switch (action.type) {
        case KUTSU_ADD_ORGANISAATIO:
            newOrganisaatios.push(action.organisaatio);
            return newOrganisaatios;
        case KUTSU_SET_ORGANISAATIO:
            newOrganisaatios[action.index] = {
                oid: action.organisaatio.oid,
                organisation: action.organisaatio,
                selectablePermissions: [],
                selectedPermissions: [],
                permissionFetched: false
            };
            return newOrganisaatios;
        case KUTSU_REMOVE_ORGANISAATIO:
            return R.filter( organisaatio => organisaatio.oid !== action.organisaatio.oid );
        case KUTSU_CLEAR_ORGANISAATIOS:
            return [];
        case FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_REQUEST:

            const kutsu = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsu.permissionFetched = false;
            return newOrganisaatios;
        case FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_SUCCESS:
            const kutsuKORSuccess = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsuKORSuccess.selectablePermissions = action.kayttooikeusryhmat;
            kutsuKORSuccess.permissionFetched = true;
            return newOrganisaatios;
        case FETCH_KUTSUJAKAYTTOOIKEUS_FOR_HENKILO_IN_ORGANISAATIO_FAILURE:
            const kutsuKORFailure = R.find(R.propEq('oid', action.organisaatioOid))(newOrganisaatios);
            kutsuKORFailure.permissionFetched = true;
            return newOrganisaatios;
        default:
            return state;
    }

};