import { filter, find, map, pipe } from 'ramda';
import { Locale } from './types/locale.type';
import { TextGroup } from './types/domain/kayttooikeus/textgroup.types';

const FORMATS = [
    {
        // used (at least) in koodistopalvelu
        isValid: (localizableText) => Array.isArray(localizableText) && localizableText.length > 0,
        getValue: (localizableText: any, uiLang: Locale) => {
            const value: any = localizableText.find((l) => l.kieli === uiLang.toUpperCase());
            return value ? value.nimi : value;
        },
        getFallbackValue: (localizableText) =>
            typeof localizableText[0] === 'object' && localizableText[0] !== null
                ? localizableText[0].nimi
                : localizableText[0],
    },
    {
        // used (at least) in henkilöpalvelu
        isValid: (localizableText) => Array.isArray(localizableText.texts) && localizableText.texts.length > 0,
        getValue: (localizableText: TextGroup, uiLang: Locale) => {
            const value = localizableText.texts.find((u) => u.lang === uiLang.toUpperCase());
            return value ? value.text : value;
        },
        getFallbackValue: (localizableText) =>
            typeof localizableText[0] === 'object' && localizableText[0] !== null
                ? localizableText[0].text
                : localizableText[0],
    },
    {
        // used (at least) in organisaatiopalvelu
        isValid: (localizableText) => typeof localizableText === 'object' && localizableText !== null,
        getValue: (localizableText, uiLang: Locale) => localizableText[uiLang.toLowerCase()],
        getFallbackValue: (localizableText) => localizableText[Object.keys(localizableText)[0]],
    },
];

const hasValue = (value) => {
    return !!value;
};

const isValid = (format, localizableText) => {
    return format.isValid(localizableText);
};

const getValue = (format, localizableText: TextGroup, uiLang: Locale, fallbackValue) => {
    const value = format.getValue(localizableText, uiLang);
    if (hasValue(value)) {
        return value;
    }
    if (hasValue(fallbackValue)) {
        return fallbackValue;
    }
    return format.getFallbackValue(localizableText);
};

export function toLocalizedText(uiLang: Locale, localizableText: any, fallbackValue?: string | null | undefined): any {
    if (typeof localizableText === 'undefined' || localizableText === null) {
        return fallbackValue;
    }
    return pipe(
        filter((format) => isValid(format, localizableText)),
        map((format) => getValue(format, localizableText, uiLang, fallbackValue)),
        find(hasValue)
    )(FORMATS);
}
