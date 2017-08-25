import { FETCH_OMATTIEDOT_REQUEST, FETCH_OMATTIEDOT_SUCCESS, FETCH_OMATTIEDOT_FAILURE } from '../actions/actiontypes';
import PropertySingleton from '../globals/PropertySingleton';
import R from 'ramda';

export const omattiedot = (state = { omattiedotLoading: false, data: undefined, initialized: false }, action) => {
    switch(action.type) {
        case FETCH_OMATTIEDOT_REQUEST:
            return Object.assign({}, state, { omattiedotLoading: true });
        case FETCH_OMATTIEDOT_SUCCESS:
            const rootOrganisaationOid = PropertySingleton.state.rootOrganisaatioOid;
            return Object.assign({}, state, {
                omattiedotLoading: false,
                data: action.omattiedot,
                isAdmin: action.omattiedot.roles.indexOf('"APP_HENKILONHALLINTA_OPHREKISTERI"') !== -1,
                isOphVirkailija: R.any((role) => role.includes(rootOrganisaationOid))(action.omattiedot.groups),
                initialized: true,
            });
        case FETCH_OMATTIEDOT_FAILURE:
            return Object.assign({}, state, { omattiedotLoading: false, initialized: true,});
        default:
            return state;
    }

};
