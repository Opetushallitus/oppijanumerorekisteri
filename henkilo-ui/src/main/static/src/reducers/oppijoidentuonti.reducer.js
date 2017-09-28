import {
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_FAILURE,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS,
    FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE,
} from '../actions/actiontypes';

export const oppijoidenTuontiYhteenveto = (state = {loading: true, data: {}}, action) => {
    switch (action.type) {
        case FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_REQUEST:
            return {...state, loading: true};
        case FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_SUCCESS:
            return {...state, loading: false, data: action.data};
        case FETCH_OPPIJOIDEN_TUONTI_YHTEENVETO_FAILURE:
            return {...state, loading: false};
        default:
            return state;
    }
};

export const oppijoidenTuontiListaus = (state = {loading: true, data: {}}, action) => {
    switch (action.type) {
        case FETCH_OPPIJOIDEN_TUONTI_LISTAUS_REQUEST:
            return {...state, loading: true};
        case FETCH_OPPIJOIDEN_TUONTI_LISTAUS_SUCCESS:
            return {...state, loading: false, data: action.data};
        case FETCH_OPPIJOIDEN_TUONTI_LISTAUS_FAILURE:
            return {...state, loading: false};
        default:
            return state;
    }
};
