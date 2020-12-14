import {L10n} from "../types/localisation.type"
import {Locale} from "../types/locale.type"
import {isEmpty} from "ramda"
import {Text} from "../types/domain/kayttooikeus/text.types"

export const localize = (key: string, l10n: L10n, locale: Locale): string => {
    return l10n[locale][key]
}

export const localizeWithState = (key: string, state: any): string => {
    return localize(key, state.l10n.localisations, state.locale)
}

export const localizeTextGroup = (
    texts: Array<Text>,
    locale: Locale,
): string | null | undefined => {
    if (isEmpty(texts) || texts === undefined || texts === null) {
        return undefined
    }

    const lang = locale.toUpperCase()
    const localizedText: Text | null | undefined = texts.find(
        text => text.lang.toUpperCase() === lang,
    )
    return localizedText ? localizedText.text : ""
}

export const getLocalization = (
    localization: {fi?: string; sv?: string; en?: string},
    locale: Locale,
): string => {
    return (
        localization[locale] ||
        localization.fi ||
        localization.sv ||
        localization.en ||
        ""
    )
}