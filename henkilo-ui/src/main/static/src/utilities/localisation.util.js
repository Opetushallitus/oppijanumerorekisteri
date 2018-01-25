// @flow

import type {L10n} from "../types/localisation.type";
import type {Locale} from "../types/locale.type";

export const localize = (key: string, l10n: L10n, locale: Locale): string => {
    return l10n[locale][key];
};

export const localizeWithState = ( key: string, state: any): string => {
    return localize(key, state.l10n.localisations, state.locale);
};