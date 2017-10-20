import R from 'ramda'

const FORMATS = [
    {
        // used (at least) in henkilöpalvelu
        isValid: (localizableText) => Array.isArray(localizableText.texts) && localizableText.texts.length > 0,
        getValue: (localizableText, uiLang) => {
            const value = R.find(R.propEq('lang', uiLang.toUpperCase()))(localizableText.texts)
            return value ? value.text : value
        },
        getFallbackValue: (localizableText) => localizableText[0]
    },
    {
        // used (at least) in organisaatiopalvelu
        isValid: (localizableText) => typeof localizableText === "object" && localizableText !== null,
        getValue: (localizableText, uiLang) => localizableText[uiLang.toLowerCase()],
        getFallbackValue: (localizableText) => Object.keys(localizableText)[0]
    }
];

const hasValue = (value) => {
    return typeof value !== 'undefined'
};

const isValid = (format, localizableText) => {
    return format.isValid(localizableText)
};

const getValue = (format, localizableText, uiLang, fallbackValue) => {
    let value = format.getValue(localizableText, uiLang);
    if (hasValue(value)) {
        return value
    }
    if (hasValue(fallbackValue)) {
        return fallbackValue
    }
    return format.getFallbackValue(localizableText)
};

export function toLocalizedText(uiLang, localizableText, fallbackValue) {
    if (typeof localizableText === 'undefined' || localizableText === null) {
        return fallbackValue
    }
    return R.pipe(
        R.filter((format) => isValid(format, localizableText)),
        R.map((format) => getValue(format, localizableText, uiLang, fallbackValue)),
        R.find(hasValue)
    )(FORMATS)
}
