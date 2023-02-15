import { FETCH_LOCALISATIONS_SUCCESS, FETCH_LOCALISATIONS_REQUEST } from '../actions/actiontypes';
import { L10n } from '../types/localisation.type';

// Return localisations by priority data (data1 before data2) and language (fi, sv, en). Use key if nothing is found.
const localisationFromAllKeys = (priorityLang: string, allKeys: Array<string>, data1: L10n, data2: L10n) => {
    const priority = [priorityLang].concat(['fi', 'sv', 'en'].filter((priority) => priority !== priorityLang));
    return allKeys
        .map((key) => ({
            [key]:
                priority
                    .map((lang) => data1[lang][key] || data2[lang][key])
                    .filter((localisation) => localisation !== undefined)[0] || key,
        }))
        .reduce((acc, current) => ({ ...acc, ...current }), {});
};

const mapLocalisations = (data: L10n, localisationData: L10n): L10n => {
    const allKeys = [].concat(
        Object.keys(data.fi),
        Object.keys(data.sv),
        Object.keys(data.en),
        Object.keys(localisationData.fi),
        Object.keys(localisationData.sv),
        Object.keys(localisationData.en)
    );
    const allKeysWithoutDuplicates = [...new Set(allKeys)];
    const localisationByPriority = (priorityLang) =>
        localisationFromAllKeys(priorityLang, allKeysWithoutDuplicates, localisationData, data);

    return {
        fi: localisationByPriority('fi'),
        sv: localisationByPriority('sv'),
        en: localisationByPriority('en'),
    };
};

export type LocalisationState = {
    localisationsInitialized: boolean;
    localisations: L10n;
};

const localisations: L10n = { fi: {}, sv: {}, en: {} };

const l10n = (
    state: LocalisationState = {
        localisationsInitialized: false,
        localisations: localisations,
    },
    action: any
) => {
    switch (action.type) {
        case FETCH_LOCALISATIONS_REQUEST:
            return { ...state, localisationsInitialized: false };
        case FETCH_LOCALISATIONS_SUCCESS:
            return Object.assign({}, state, {
                localisations: mapLocalisations(state.localisations, action.localisations),
                localisationsInitialized: true,
            });
        default:
            return state;
    }
};

export default l10n;
