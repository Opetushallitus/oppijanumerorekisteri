import { Locale } from '../types/locale.type';
import { TextGroup } from '../types/domain/kayttooikeus/textgroup.types';

export const getTextGroupLocalisation = (textGroup: TextGroup | null | undefined, locale: Locale) =>
    textGroup?.texts.find((t) => t.lang.toUpperCase() === locale.toUpperCase())?.text ?? '';

export const getLocalization = (localization?: { fi?: string; sv?: string; en?: string }, l?: Locale): string => {
    const locale = l ?? 'fi';
    return localization?.[locale] || localization?.fi || localization?.sv || localization?.en || '';
};
