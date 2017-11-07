import { FETCH_ALL_RYHMAT_REQUEST, FETCH_ALL_RYHMAT_SUCCESS, FETCH_ALL_RYHMAT_FAILURE } from '../actions/actiontypes';

export const ryhmatState = (state = {ryhmasLoading: false, ryhmas: []}, action) => {
    switch (action.type) {
        case FETCH_ALL_RYHMAT_REQUEST:
            return Object.assign({}, state, { ryhmasLoading: true, ryhmas: [] });
        case FETCH_ALL_RYHMAT_SUCCESS:
            return Object.assign({}, state, { ryhmasLoading: false, ryhmas: action.ryhmas });
        case FETCH_ALL_RYHMAT_FAILURE:
            return Object.assign({}, state, { ryhmasLoading: false, });
        default:
            return state;
    }
};
