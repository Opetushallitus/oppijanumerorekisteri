import { SingleValue } from 'react-select';

import { Localisations, L10n } from '../../types/localisation.type';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { Locale } from '../../types/locale.type';
import { TextGroup } from '../../types/domain/kayttooikeus/textgroup.types';
import { Organisaatio } from '../../types/domain/organisaatio/organisaatio.types';
import { NamedMultiSelectOption, NamedSelectOption } from '../../utilities/select';
import { Koodi, Koodisto } from '../../api/koodisto';
import type { HenkiloDuplicate } from '../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';

// Example fieldpath: organisaatio.nimet.0.nimiValue
export function updateFieldByDotAnnotation<T extends Record<string, any>>(
    obj: T,
    event: React.SyntheticEvent<HTMLInputElement> | null
): T | null {
    if (event === null) {
        return null;
    }
    const value = (event.currentTarget || (event.target as HTMLInputElement)).value;
    const fieldpath = (event.currentTarget || (event.target as HTMLInputElement)).name;
    return updateByDotAnnotation(obj, value, fieldpath);
}

export function updateSelectValueByDotAnnotation<T extends Record<string, any>>(
    obj: T,
    event: SingleValue<NamedSelectOption> | NamedMultiSelectOption
): T | null {
    if (event === null) {
        return null;
    }
    const value = event.value;
    const fieldpath = event.optionsName;
    return updateByDotAnnotation(obj, value, fieldpath);
}

export function updateByDotAnnotation<T extends Record<string, any>>(
    obj: T,
    value: string | unknown[],
    fieldpath: string
): T | null {
    let schema: Record<string, any> = obj; // a moving reference to internal objects within obj
    const pList = fieldpath.split('.');
    const len = pList.length;
    for (let i = 0; i < len - 1; i++) {
        const elem = pList[i] ?? '';
        if (!schema[elem]) {
            schema[elem] = {};
        }
        schema = schema[elem];
    }

    schema[pList[len - 1] ?? ''] = value;

    return obj;
}

export function isVahvastiYksiloity(henkilo?: Henkilo | HenkiloDuplicate) {
    return henkilo?.yksiloityVTJ || henkilo?.yksiloityEidas;
}

export function getOrganisaatiotyypitFlat(L: Localisations, uppercase: boolean, tyypit?: string[]) {
    return tyypit?.length
        ? '(' +
              tyypit
                  .map((tyyppi) => L[tyyppi.toUpperCase() + (uppercase ? '_ISO' : '')] || tyyppi)
                  .reduce((type1, type2) => type1.concat(', ', type2)) +
              ')'
        : '';
}

export function getOrganisationNameWithType(org: Organisaatio | undefined, L: Localisations, locale: Locale) {
    return org?.nimi?.[locale] + ' ' + getOrganisaatiotyypitFlat(L, false, org?.tyypit);
}

export const defaultOrganisaatio = (organisaatioOid: string, l10n?: L10n): Organisaatio => ({
    oid: organisaatioOid,
    nimi: {
        fi: (l10n && l10n['fi'] && l10n['fi']['ORGANISAATIO_NIMI_EI_LOYDY']) || organisaatioOid,
        sv: (l10n && l10n['sv'] && l10n['sv']['ORGANISAATIO_NIMI_EI_LOYDY']) || organisaatioOid,
        en: (l10n && l10n['en'] && l10n['en']['ORGANISAATIO_NIMI_EI_LOYDY']) || organisaatioOid,
    },
    tyypit: [],
    parentOidPath: '',
    status: 'PASSIIVINEN',
});

export function getLocalisedText(description: TextGroup | null | undefined, locale: Locale) {
    return description ? description.texts.filter((text) => text.lang.toLowerCase() === locale)[0]?.text : '';
}

export function getKoodiNimi(koodiArvo: string, koodisto: Koodisto, locale: Locale) {
    return (
        koodisto
            .find((k) => k.koodiArvo === koodiArvo)
            ?.metadata?.find((m) => m.kieli?.toUpperCase() === locale.toUpperCase())?.nimi ?? koodiArvo
    );
}

export function localizeKoodiNimi(koodi: Koodi, locale: Locale) {
    return koodi?.metadata?.find((m) => m.kieli?.toUpperCase() === locale.toUpperCase())?.nimi ?? koodi.koodiArvo;
}
