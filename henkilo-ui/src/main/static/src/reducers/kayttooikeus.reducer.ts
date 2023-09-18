import { PalveluKayttooikeus } from '../types/domain/kayttooikeus/palvelukayttooikeus.types';
import { FETCH_PALVELUKAYTTOOIKEUS_SUCCESS } from '../actions/actiontypes';
import { PalveluKayttooikeusAction } from '../actions/kayttooikeus.actions';

export type KayttooikeusState = {
    readonly palveluKayttooikeus: Array<PalveluKayttooikeus>;
};

export const kayttooikeusState = (
    state: KayttooikeusState = {
        palveluKayttooikeus: [],
    },
    action: PalveluKayttooikeusAction
): KayttooikeusState => {
    switch (action.type) {
        case FETCH_PALVELUKAYTTOOIKEUS_SUCCESS:
            return {
                ...state,
                palveluKayttooikeus: action.payload,
            };
        default:
            return state;
    }
};
