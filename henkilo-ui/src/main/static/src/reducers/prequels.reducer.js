import {
    FETCH_PREQUEL_REQUEST, FETCH_PREQUEL_SUCCESS
} from '../actions/actiontypes';

export const prequels = (state = {notLoadedCount: 2,}, action) => {
    switch (action.type) {
        case FETCH_PREQUEL_REQUEST:
            return Object.assign({}, state);
        case FETCH_PREQUEL_SUCCESS:
            return Object.assign({}, state, {notLoadedCount: state.notLoadedCount-1});
        default:
            return state;
    }
};
