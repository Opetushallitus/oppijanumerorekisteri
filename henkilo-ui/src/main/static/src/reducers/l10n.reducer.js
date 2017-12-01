// @flow
import {FETCH_L10N_SUCCESS, FETCH_L10N_REQUEST, FETCH_LOCALISATION_REQUEST,
    FETCH_LOCALISATION_SUCCESS} from '../actions/actiontypes';
import type {L10n} from "../types/localisation.type";
import * as R from 'ramda';


const mapLocalisations = (data: L10n, localisationData: L10n): L10n => {
    const mergedLocalisations: L10n = R.mergeDeepLeft(localisationData, data);
    const fiKeys: Array<string> = Object.keys(mergedLocalisations.fi);
    const svKeys: Array<string> = Object.keys(mergedLocalisations.sv);
    const enKeys: Array<string> = Object.keys(mergedLocalisations.en);

    if (fiKeys.length > svKeys.length) {
        const missingSvLocalisation = R.omit(svKeys, mergedLocalisations.fi);
        mergedLocalisations.sv = R.merge(missingSvLocalisation, mergedLocalisations.sv);
    }

    if (fiKeys.length > enKeys.length) {
        const missingEnLocalisation = R.omit(enKeys, mergedLocalisations.fi);
        mergedLocalisations.en = R.merge(missingEnLocalisation, mergedLocalisations.en);
    }

    return mergedLocalisations;
};

const mapLocalisationsByLocale = (localisations: Array<any>): L10n => {
    const result = { fi: {}, sv: {}, en: {} };
    localisations.forEach( (localisation: any) => {
        result[localisation.locale][localisation.key] = localisation.value;
    });
    return result;
};

type State = {
    l10nInitialized: boolean,
    localisationsInitialized: boolean,
    localisations: L10n
}

const localisations: L10n = { fi: {}, sv: {}, en: {} };

export const l10n = (state: State = {l10nInitialized: false, localisationsInitialized: false, localisations: localisations}, action: any) => {
    switch (action.type) {
        case FETCH_L10N_REQUEST:
            return Object.assign({}, state, {l10nInitialized: false});
        case FETCH_LOCALISATION_REQUEST:
            return Object.assign({}, state, {localisationsInitialized: false});
        case FETCH_L10N_SUCCESS:
            if(!state.localisationsInitialized) {
                return Object.assign({}, state, {l10nInitialized: true, localisations: action.data});
            }
            return Object.assign({}, state, {
                localisations: mapLocalisations(action.data, state.localisations),
                l10nInitialized: true,
            });
        case FETCH_LOCALISATION_SUCCESS:
            const localisationByLocale = mapLocalisationsByLocale(action.data);
            if(!state.l10nInitialized) {
                return Object.assign({}, state, {localisationsInitialized: true, localisations: action.data});
            }
            return Object.assign({}, state, {
                localisations: mapLocalisations(state.localisations, localisationByLocale),
                localisationsInitialized: true,
            });
        default:
            return state;
    }
};

