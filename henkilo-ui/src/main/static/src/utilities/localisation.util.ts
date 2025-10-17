import { Locale } from '../types/locale.type';
import { Text } from '../types/domain/kayttooikeus/text.types';

export const localizeTextGroup = (textGroups: Text[] = [], lang: Locale): string =>
    textGroups.find((t) => t.lang.toUpperCase() === lang.toUpperCase())?.text ?? '';

export const getLocalization = (localization?: { fi?: string; sv?: string; en?: string }, l?: Locale): string => {
    const locale = l ?? 'fi';
    return localization?.[locale] || localization?.fi || localization?.sv || localization?.en || '';
};
