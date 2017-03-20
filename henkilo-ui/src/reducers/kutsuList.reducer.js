import { FETCH_KUTSU_SUCCESS, FETCH_KUTSU_REQUEST} from '../actions/actiontypes';

export const kutsuList = (state = {loaded: false, result: []}, action) => {
    switch (action.type) {
        case FETCH_KUTSU_REQUEST:
            return Object.assign({}, state, {loaded: false});
        case FETCH_KUTSU_SUCCESS:
            return Object.assign({}, state, {result: action.kutsuList, loaded: true}, );
        default:
            return state;
    }
};