// @flow

import type {L10n} from "../types/localisation.type";
import type {Locale} from "../types/locale.type";
import {isEmpty} from 'ramda';
import type {Text} from "../types/domain/kayttooikeus/text.types";

export const localize = (key: string, l10n: L10n, locale: Locale): string => {
    return l10n[locale][key];
};

export const localizeWithState = ( key: string, state: any): string => {
    return localize(key, state.l10n.localisations, state.locale);
};

export const localizeTextGroup = (texts: Array<Text>, locale: Locale): ?string => {
    if(isEmpty(texts) || texts === undefined || texts === null) {
        return undefined;
    }

    const lang = locale.toUpperCase();
    const localizedText: ?Text = texts.find(text => text.lang.toUpperCase() === lang);
    return localizedText ? localizedText.text : ''
};