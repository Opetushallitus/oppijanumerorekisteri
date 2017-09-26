import { FETCH_OMATTIEDOT_REQUEST, FETCH_OMATTIEDOT_SUCCESS, FETCH_OMATTIEDOT_FAILURE,
    FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST, FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS, FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE} from '../actions/actiontypes';
import PropertySingleton from '../globals/PropertySingleton';
import R from 'ramda';

export const omattiedot = (state = { omattiedotLoading: false, data: undefined, initialized: false, omattiedotOrganisaatiosLoading: true, organisaatios: [] }, action) => {
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
        case FETCH_OMATTIEDOT_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, { omattiedotOrganisaatiosLoading: true});
        case FETCH_OMATTIEDOT_ORGANISAATIOS_SUCCESS:
            return Object.assign({}, state, { organisaatios: action.organisaatios, omattiedotOrganisaatiosLoading: false } );
        case FETCH_OMATTIEDOT_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, { omattiedotOrganisaatiosLoading: false } );
        default:
            return state;
    }

};
