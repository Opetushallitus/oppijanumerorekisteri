// @flow
import * as R from 'ramda'
import type {Locale} from "./types/locale.type";
import type {TextGroup} from "./types/domain/kayttooikeus/textgroup.types";

const FORMATS = [
    {
        // used (at least) in koodistopalvelu
        isValid: (localizableText) => Array.isArray(localizableText) && localizableText.length > 0,
        getValue: (localizableText: any, uiLang: Locale) => {
            const value: any = R.find(R.propEq('kieli', uiLang.toUpperCase()))(localizableText);
            return value ? value.nimi : value
        },
        getFallbackValue: (localizableText) => localizableText[0]
    },
    {
        // used (at least) in henkilöpalvelu
        isValid: (localizableText) => Array.isArray(localizableText.texts) && localizableText.texts.length > 0,
        getValue: (localizableText: TextGroup, uiLang: Locale) => {
            const value = R.find(R.propEq('lang', uiLang.toUpperCase()))(localizableText.texts);
            return value ? value.text : value
        },
        getFallbackValue: (localizableText) => localizableText[0]
    },
    {
        // used (at least) in organisaatiopalvelu
        isValid: (localizableText) => typeof localizableText === "object" && localizableText !== null,
        getValue: (localizableText, uiLang: Locale) => localizableText[uiLang.toLowerCase()],
        getFallbackValue: (localizableText) => localizableText[Object.keys(localizableText)[0]]
    }
];

const hasValue = (value) => {
    return typeof value !== 'undefined'
};

const isValid = (format, localizableText) => {
    return format.isValid(localizableText)
};

const getValue = (format, localizableText: TextGroup, uiLang, fallbackValue) => {
    let value = format.getValue(localizableText, uiLang);
    if (hasValue(value)) {
        return value
    }
    if (hasValue(fallbackValue)) {
        return fallbackValue
    }
    return format.getFallbackValue(localizableText)
};

export function toLocalizedText(uiLang: Locale, localizableText: any, fallbackValue: ?string): any {
    if (typeof localizableText === 'undefined' || localizableText === null) {
        return fallbackValue;
    }
    return R.pipe(
        R.filter((format) => isValid(format, localizableText)),
        R.map((format) => getValue(format, localizableText, uiLang, fallbackValue)),
        R.find(hasValue)
    )(FORMATS)
}
