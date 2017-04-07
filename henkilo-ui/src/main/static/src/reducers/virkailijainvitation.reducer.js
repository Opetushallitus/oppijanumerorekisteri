import R from 'ramda';

import {KUTSU_ADD_ORGANISAATIO,
    KUTSU_CLEAR_ORGANISAATIOS,
    KUTSU_REMOVE_ORGANISAATIO} from '../actions/actiontypes';

export const virkailijaInvitationOrganisaatios = (state = [], action) => {
    const newOrganisaatios = state.slice();
    
    switch (action.type) {
        case KUTSU_ADD_ORGANISAATIO:
            newOrganisaatios.push(action.organisaatio);
            return newOrganisaatios;
        case KUTSU_REMOVE_ORGANISAATIO:
            return R.filter( organisaatio => organisaatio.oid !== action.organisaatio.oid );
        case KUTSU_CLEAR_ORGANISAATIOS:
            return [];
        default:
            return state;
    }

};