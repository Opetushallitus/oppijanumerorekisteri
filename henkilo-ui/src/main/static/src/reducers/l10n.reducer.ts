import { AnyAction } from '@reduxjs/toolkit';

import { FETCH_LOCALISATIONS_SUCCESS } from '../actions/actiontypes';
import { L10n } from '../types/localisation.type';

export type LocalisationState = {
    localisations: L10n;
};
const l10n = (
    state: LocalisationState = {
        localisations: { fi: {}, sv: {}, en: {} },
    },
    action: AnyAction
): LocalisationState => {
    switch (action.type) {
        case FETCH_LOCALISATIONS_SUCCESS:
            return { ...state, localisations: action.localisations };
        default:
            return state;
    }
};

export default l10n;
