// @flow
import {FETCH_L10N_SUCCESS, FETCH_L10N_REQUEST, FETCH_LOCALISATION_REQUEST,
    FETCH_LOCALISATION_SUCCESS} from '../actions/actiontypes';
import type {L10n} from "../types/localisation.type";
import * as R from 'ramda';

// Return localisations by priority data (data1 before data2) and language (fi, sv, en). Use key if nothing is found.
const localisationFromAllKeys = (priorityLang: string, allKeys: Array<string>, data1: L10n, data2: L10n) => {
    const priority = [priorityLang].concat(['fi', 'sv', 'en'].filter(priority => priority !== priorityLang));
    return allKeys
        .map(key => ({
            [key]: priority.map(lang => data1[lang][key] || data2[lang][key])
                .filter(localisation => localisation !== undefined)[0] || key
        }))
        .reduce((acc, current) => R.merge(acc, current), {});
};

const mapLocalisations = (data: L10n, localisationData: L10n): L10n => {
    const allKeys = [].concat(Object.keys(data.fi),
        Object.keys(data.sv),
        Object.keys(data.en),
        Object.keys(localisationData.fi),
        Object.keys(localisationData.sv),
        Object.keys(localisationData.en));
    const allKeysWithoutDuplicates = [...new Set(allKeys)];
    const localisationByPriority = priorityLang => localisationFromAllKeys(priorityLang, allKeysWithoutDuplicates, localisationData, data);

    return {
        fi: localisationByPriority('fi'),
        sv: localisationByPriority('sv'),
        en: localisationByPriority('en'),
    };
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
            if (!state.localisationsInitialized) {
                return Object.assign({}, state, {l10nInitialized: true, localisations: action.data});
            }
            return Object.assign({}, state, {
                localisations: mapLocalisations(action.data, state.localisations),
                l10nInitialized: true,
            });
        case FETCH_LOCALISATION_SUCCESS:
            const localisationByLocale = mapLocalisationsByLocale(action.data);
            if (!state.l10nInitialized) {
                return Object.assign({}, state, {localisationsInitialized: true, localisations: localisationByLocale});
            }
            return Object.assign({}, state, {
                localisations: mapLocalisations(state.localisations, localisationByLocale),
                localisationsInitialized: true,
            });
        default:
            return state;
    }
};

