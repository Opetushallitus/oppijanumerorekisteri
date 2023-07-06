import { L10n } from '../types/localisation.type';
import { Locale } from '../types/locale.type';
import { Text } from '../types/domain/kayttooikeus/text.types';

export const localize = (key: string, l10n: L10n, locale: Locale): string => {
    return l10n[locale][key];
};

export const localizeWithState = (key: string, state: any): string => {
    return localize(key, state.l10n.localisations, state.locale);
};

export const localizeTextGroup = (textGroups: Text[] = [], lang = 'fi'): string =>
    [...textGroups, { text: '', lang: lang.toUpperCase() }].filter(
        (textGroup) => (textGroup.lang || 'fi').toUpperCase() === lang.toUpperCase()
    )[0].text;

export const getLocalization = (localization: { fi?: string; sv?: string; en?: string }, locale: Locale): string => {
    return localization[locale] || localization.fi || localization.sv || localization.en || '';
};
