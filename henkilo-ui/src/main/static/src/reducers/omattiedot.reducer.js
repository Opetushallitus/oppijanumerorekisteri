import { FETCH_OMATTIEDOT_REQUEST, FETCH_OMATTIEDOT_SUCCESS, FETCH_OMATTIEDOT_FAILURE } from '../actions/actiontypes';

export const omattiedot = (state = { omattiedotLoading: true, omattiedot: undefined }, action) => {
    switch(action.type) {
        case FETCH_OMATTIEDOT_REQUEST:
            return Object.assign({}, state, { omattiedotLoading: true });
        case FETCH_OMATTIEDOT_SUCCESS:
            return Object.assign({}, state, { omattiedotLoading: false, omattiedot: action.omattiedot });
        case FETCH_OMATTIEDOT_FAILURE:
            return Object.assign({}, state, { omattiedotLoading: false, });
        default:
            return state;
    }

};