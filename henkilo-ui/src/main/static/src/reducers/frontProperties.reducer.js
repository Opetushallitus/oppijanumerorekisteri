import {FETCH_FRONTPROPERTIES_REQUEST,
    FETCH_FRONTPROPERTIES_SUCCESS} from '../actions/actiontypes';

export const frontProperties = (state = {initialized: false,}, action) => {
    switch (action.type) {
        case FETCH_FRONTPROPERTIES_REQUEST:
            return Object.assign({}, state, {initialized: false});
        case FETCH_FRONTPROPERTIES_SUCCESS:
            return Object.assign({}, state, {initialized: true});
        default:
            return state;
    }
};