import {HENKILOHAKU_FAILURE, HENKILOHAKU_REQUEST, HENKILOHAKU_SUCCESS} from "../actions/actiontypes";

export const henkilohakuState = (state = { filters: {}, henkilohakuLoading: false, result: [],}, action) => {
    switch (action.type) {
        case HENKILOHAKU_REQUEST:
            return Object.assign({}, state, {henkilohakuLoading: true, filters: action.filters, });
        case HENKILOHAKU_SUCCESS:
            return Object.assign({}, state, {henkilohakuLoading: false, result: action.data, });
        case HENKILOHAKU_FAILURE:
            return Object.assign({}, state, {henkilohakuLoading: false, });
        default:
            return state;
    }
};
