import { SingleValue } from 'react-select';

import { Localisations, L10n } from '../../types/localisation.type';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { Locale } from '../../types/locale.type';
import { TextGroup } from '../../types/domain/kayttooikeus/textgroup.types';
import { Organisaatio } from '../../types/domain/organisaatio/organisaatio.types';
import { NamedMultiSelectOption, NamedSelectOption } from '../../utilities/select';
import { Koodi, Koodisto } from '../../api/koodisto';
import type { HenkiloDuplicate } from '../../types/domain/oppijanumerorekisteri/HenkiloDuplicate';

class StaticUtils {
    // Example fieldpath: organisaatio.nimet.0.nimiValue
    static updateFieldByDotAnnotation<T extends Record<string, any>>(
        obj: T,
        event: React.SyntheticEvent<HTMLInputElement> | null
    ): T | null {
        if (event === null) {
            return null;
        }
        const value = (event.currentTarget || (event.target as HTMLInputElement)).value;
        const fieldpath = (event.currentTarget || (event.target as HTMLInputElement)).name;
        return this.updateByDotAnnotation(obj, value, fieldpath);
    }

    static updateSelectValueByDotAnnotation<T extends Record<string, any>>(
        obj: T,
        event: SingleValue<NamedSelectOption> | NamedMultiSelectOption
    ): T | null {
        if (event === null) {
            return null;
        }
        const value = event.value;
        const fieldpath = event.optionsName;
        return this.updateByDotAnnotation(obj, value, fieldpath);
    }

    static updateByDotAnnotation<T extends Record<string, any>>(
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

    static findOrCreateYhteystiedotRyhmaFlat(
        henkiloUpdate: Henkilo,
        ryhmakuvaus: string,
        yhteystietotyyppi: string,
        label: string
    ) {
        let yhteystiedotRyhmaIndex: number | null = null;
        let yhteystietoIndex: number | null = null;
        let yhteystietoRyhma = henkiloUpdate.yhteystiedotRyhma.filter((yhteystiedotRyhma, idx) => {
            const yhteystietoByTyyppi = yhteystiedotRyhma.yhteystieto.filter(
                (yhteystieto) => yhteystieto.yhteystietoTyyppi === yhteystietotyyppi
            )[0];
            if (
                yhteystiedotRyhmaIndex === null &&
                yhteystiedotRyhma.ryhmaKuvaus === ryhmakuvaus &&
                yhteystietoByTyyppi &&
                yhteystietoByTyyppi.yhteystietoArvo &&
                yhteystietoByTyyppi.yhteystietoArvo !== ''
            ) {
                yhteystiedotRyhmaIndex = idx;
                return true;
            }
            return false;
        })[0];
        let yhteystieto = yhteystietoRyhma
            ? yhteystietoRyhma.yhteystieto.filter((yhteystieto, idx) => {
                  if (yhteystietoIndex === null && yhteystieto.yhteystietoTyyppi === yhteystietotyyppi) {
                      yhteystietoIndex = idx;
                      return true;
                  }
                  return false;
              })[0]
            : null;
        if (yhteystiedotRyhmaIndex === null) {
            yhteystiedotRyhmaIndex = henkiloUpdate.yhteystiedotRyhma.length;
            yhteystietoRyhma = {
                // readOnly: false, // TODO: not defined in type -- ensure that it's legit
                ryhmaAlkuperaTieto: 'alkupera2', // Virkailija
                ryhmaKuvaus: ryhmakuvaus,
                yhteystieto: [],
            };
            henkiloUpdate.yhteystiedotRyhma.push(yhteystietoRyhma);
        }

        if (yhteystietoIndex === null) {
            yhteystietoIndex = henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex]?.yhteystieto.length ?? 0;
            yhteystieto = {
                yhteystietoTyyppi: yhteystietotyyppi,
                yhteystietoArvo: '',
            };
            henkiloUpdate.yhteystiedotRyhma[yhteystiedotRyhmaIndex]?.yhteystieto.push(yhteystieto);
        }
        return {
            label: label,
            value: yhteystieto?.yhteystietoArvo,
            inputValue:
                'yhteystiedotRyhma.' + yhteystiedotRyhmaIndex + '.yhteystieto.' + yhteystietoIndex + '.yhteystietoArvo',
        };
    }

    static isVahvastiYksiloity(henkilo?: Henkilo | HenkiloDuplicate) {
        return henkilo?.yksiloityVTJ || henkilo?.yksiloityEidas;
    }

    static getOrganisaatiotyypitFlat(L: Localisations, uppercase: boolean, tyypit?: Array<string>) {
        return tyypit?.length
            ? '(' +
                  tyypit
                      .map((tyyppi) => L[tyyppi.toUpperCase() + (uppercase ? '_ISO' : '')] || tyyppi)
                      .reduce((type1, type2) => type1.concat(', ', type2)) +
                  ')'
            : '';
    }

    static getOrganisationNameWithType(org: Organisaatio | undefined, L: Localisations, locale: Locale) {
        return org?.nimi?.[locale] + ' ' + StaticUtils.getOrganisaatiotyypitFlat(L, false, org?.tyypit);
    }

    static defaultOrganisaatio = (organisaatioOid: string, l10n?: L10n): Organisaatio => ({
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

    static getLocalisedText(description: TextGroup | null | undefined, locale: Locale) {
        return description ? description.texts.filter((text) => text.lang.toLowerCase() === locale)[0]?.text : '';
    }

    static getKoodiNimi(koodiArvo: string, koodisto: Koodisto, locale: Locale) {
        return (
            koodisto
                .find((k) => k.koodiArvo === koodiArvo)
                ?.metadata?.find((m) => m.kieli?.toUpperCase() === locale.toUpperCase())?.nimi ?? koodiArvo
        );
    }

    static localizeKoodiNimi(koodi: Koodi, locale: Locale) {
        return koodi?.metadata?.find((m) => m.kieli?.toUpperCase() === locale.toUpperCase())?.nimi ?? koodi.koodiArvo;
    }
}

export default StaticUtils;
