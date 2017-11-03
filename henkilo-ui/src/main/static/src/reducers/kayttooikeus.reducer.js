// @flow

import type {PalveluKayttooikeus} from "../types/domain/kayttooikeus/palvelukayttooikeus.types";
import {FETCH_PALVELUKAYTTOOIKEUS_REQUEST, FETCH_PALVELUKAYTTOOIKEUS_SUCCESS, FETCH_PALVELUKAYTTOOIKEUS_FAILURE} from "../actions/actiontypes";
import type {PalveluKayttooikeusAction} from "../actions/kayttooikeus.actions";

export type KayttooikeusState = {
    +palveluKayttooikeusLoading: boolean,
    +palveluKayttooikeus: Array<PalveluKayttooikeus>
}

export const kayttooikeusState = (state: KayttooikeusState = {palveluKayttooikeusLoading: false, palveluKayttooikeus: []}, action: PalveluKayttooikeusAction): KayttooikeusState => {

    switch (action.type) {
        case FETCH_PALVELUKAYTTOOIKEUS_REQUEST:
            return {...state, palveluKayttooikeusLoading: true};
        case FETCH_PALVELUKAYTTOOIKEUS_SUCCESS:
            return {...state, palveluKayttooikeusLoading: false, palveluKayttooikeus: action.payload};
        case FETCH_PALVELUKAYTTOOIKEUS_FAILURE:
            return {...state, palveluKayttooikeusLoading: false};
        default:
            return state;
    }
};
