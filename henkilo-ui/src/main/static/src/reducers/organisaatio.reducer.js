import { FETCH_ALL_ORGANISAATIOS_REQUEST, FETCH_ALL_ORGANISAATIOS_SUCCESS, FETCH_ALL_ORGANISAATIOS_FAILURE } from '../actions/actiontypes';


export const organisaatioState = (state = {organisaatioLoading: false, organisaatiot: []}, action) => {
    switch(action.type) {
        case FETCH_ALL_ORGANISAATIOS_REQUEST:
            return Object.assign({}, state, { organisaatioLoading: true, organisaatiot: [] });
        case FETCH_ALL_ORGANISAATIOS_SUCCESS:
            return Object.assign({}, state, { organisaatioLoading: false, organisaatiot: action.organisaatios });
        case FETCH_ALL_ORGANISAATIOS_FAILURE:
            return Object.assign({}, state, { organisaatioLoading: false, organisaatiot: [] });
        default:
            return state;
    }
};
