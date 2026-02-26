import { Locale } from './locale.type';

export type LocalisationFn = (key: string) => string;

export type Localisations = Record<string, string>;

export type L10n = Record<Locale, Localisations>;
