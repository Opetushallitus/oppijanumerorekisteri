import {
    FETCH_KUTSU_SUCCESS, FETCH_KUTSU_REQUEST, FETCH_KUTSUBYTOKEN_REQUEST,
    FETCH_KUTSUBYTOKEN_SUCCESS, FETCH_KUTSUBYTOKEN_FAILURE, CLEAR_KUTSU_LIST,
} from '../actions/actiontypes';

export const kutsuList = (state = {loaded: false, result: [], kutsuByToken: {}, kutsuByTokenLoading: true,}, action) => {
    switch (action.type) {
        case FETCH_KUTSU_REQUEST:
            return Object.assign({}, state, {loaded: false});
        case FETCH_KUTSU_SUCCESS:
            return Object.assign({}, state, {result: action.kutsus, loaded: true}, );
        case FETCH_KUTSUBYTOKEN_REQUEST:
            return Object.assign({}, state, {kutsuByTokenLoading: true,});
        case FETCH_KUTSUBYTOKEN_SUCCESS:
            return Object.assign({}, state, {
                kutsuByTokenLoading: false,
                kutsuByToken: action.kutsu,
            });
        case FETCH_KUTSUBYTOKEN_FAILURE:
            return Object.assign({}, state, {kutsuByTokenLoading: false,});
        case CLEAR_KUTSU_LIST:
            return Object.assign({}, state, {result: []});
        default:
            return state;
    }
};
