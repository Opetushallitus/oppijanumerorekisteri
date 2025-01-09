import { Locale } from './locale.type';

export type Localisations = Record<string, string>;

export type L10n = Record<Locale, Localisations>;
