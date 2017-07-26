import { FETCH_OMATTIEDOT_REQUEST, FETCH_OMATTIEDOT_SUCCESS, FETCH_OMATTIEDOT_FAILURE } from '../actions/actiontypes';

export const omattiedot = (state = { omattiedotLoading: true, data: undefined, initialized: false }, action) => {
    switch(action.type) {
        case FETCH_OMATTIEDOT_REQUEST:
            return Object.assign({}, state, { omattiedotLoading: true });
        case FETCH_OMATTIEDOT_SUCCESS:
            return Object.assign({}, state, {
                omattiedotLoading: false,
                data: action.omattiedot,
                isAdmin: action.omattiedot.roles.indexOf('"APP_HENKILONHALLINTA_OPHREKISTERI"') !== -1,
                initialized: true,
            });
        case FETCH_OMATTIEDOT_FAILURE:
            return Object.assign({}, state, { omattiedotLoading: false, initialized: true,});
        default:
            return state;
    }

};
