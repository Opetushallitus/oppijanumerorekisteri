import { Locale } from '../types/locale.type';
import { Text } from '../types/domain/kayttooikeus/text.types';

export const localizeTextGroup = (textGroups: Text[] = [], lang = 'fi'): string =>
    [...textGroups, { text: '', lang: lang.toUpperCase() }].filter(
        (textGroup) => (textGroup.lang || 'fi').toUpperCase() === lang.toUpperCase()
    )[0].text;

export const getLocalization = (localization: { fi?: string; sv?: string; en?: string }, locale: Locale): string => {
    return localization[locale] || localization.fi || localization.sv || localization.en || '';
};
