import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { skipToken } from '@reduxjs/toolkit/query';

import { LocalisationFn, Localisations, L10n } from './types/localisation.type';
import { Locale } from './types/locale.type';
import {
    useGetKayttajatiedotQuery,
    useGetKayttooikeusryhmasForHenkiloQuery,
    useGetOmatKayttooikeusryhmasQuery,
    useGetOmatOrganisaatiotQuery,
    useGetOmattiedotQuery,
} from './api/kayttooikeus';
import { Localisation, useGetLocalisationsQuery } from './api/lokalisointi';
import { useGetLocaleQuery } from './api/oppijanumerorekisteri';
import { useGetKansalaisuudetQuery, useGetKieletQuery, useGetSukupuoletQuery } from './api/koodisto';
import { localizeKoodiNimi } from './components/common/StaticUtils';
import { OrganisaatioWithChildren } from './types/domain/organisaatio/organisaatio.types';

const VALID_KIELI_URI_FOR_ASIOINTIKIELI = ['kieli_fi', 'kieli_sv', 'kieli_en'];

export function toSupportedLocale(anyLocale?: string): Locale {
    const locale = anyLocale?.toLocaleLowerCase();
    if (locale === 'fi' || locale === 'sv') {
        return locale;
    } else {
        return 'fi';
    }
}

const mapLocalisationsByLocale = (localisations?: Localisation[]): L10n => {
    const result: L10n = { fi: {}, sv: {}, en: {} };
    localisations?.forEach((localisation) => {
        try {
            result[localisation.locale][localisation.key] = localisation.value;
        } catch {
            // nop, survive malformed data from localization service
        }
    });
    return result;
};

export const useLocalisations = (
    skipUserLocale = false
): {
    L: LocalisationFn;
    locale: Locale;
    allLocalisations: L10n;
    getLocalisations: (l?: string) => Localisations;
} => {
    const { data: locale } = useGetLocaleQuery(undefined, { skip: skipUserLocale });
    const supportedLocale = toSupportedLocale(locale);
    const { data: localisations } = useGetLocalisationsQuery('henkilo-ui');
    const { L, allLocalisations, getLocalisations } = useMemo(() => {
        const allLocalisations = mapLocalisationsByLocale(localisations);
        const L = (key: string) => allLocalisations[supportedLocale][key] ?? key;
        const getLocalisations = (l?: string) => allLocalisations?.[toSupportedLocale(l)];
        return { L, allLocalisations, getLocalisations };
    }, [localisations, supportedLocale]);
    return { L, locale: supportedLocale, allLocalisations, getLocalisations };
};

export const useOmatOrganisaatiot = () => {
    const { locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: omatOrganisaatiot } = useGetOmatOrganisaatiotQuery(
        omattiedot ? { oid: omattiedot.oidHenkilo, locale } : skipToken
    );
    return omatOrganisaatiot;
};

export function useOmatRyhmat(): OrganisaatioWithChildren[] {
    const omatOrganisaatiot = useOmatOrganisaatiot() ?? [];
    const ryhmat = useMemo(() => {
        const flattened = omatOrganisaatiot.map((_) => _.organisaatio).flatMap(flattenOrganisaatioWithChildren);
        return flattened.filter((_) => _.tyypit.includes('Ryhma'));
    }, [omatOrganisaatiot]);
    return ryhmat;
}

function flattenOrganisaatioWithChildren(org: OrganisaatioWithChildren): OrganisaatioWithChildren[] {
    return [org, ...org.children.flatMap(flattenOrganisaatioWithChildren)];
}

export const useKayttooikeusryhmas = (isOmattiedot: boolean, henkiloOid: string) => {
    const kayttooikeusryhmas = useGetKayttooikeusryhmasForHenkiloQuery(henkiloOid, { skip: isOmattiedot });
    const omatKayttooikeusryhma = useGetOmatKayttooikeusryhmasQuery(undefined, { skip: !isOmattiedot });
    return isOmattiedot ? omatKayttooikeusryhma : kayttooikeusryhmas;
};

export const useAsiointikielet = (locale: Locale) => {
    const kielet = useGetKieletQuery().data ?? [];
    const asiointikielet = kielet.filter((koodi) => VALID_KIELI_URI_FOR_ASIOINTIKIELI.includes(koodi.koodiUri));
    const options = useMemo(() => {
        return (
            asiointikielet.map((koodi) => ({
                value: koodi.koodiArvo.toLowerCase(),
                label: localizeKoodiNimi(koodi, locale),
                optionsName: 'asiointiKieli.kieliKoodi',
            })) ?? []
        );
    }, [kielet, locale]);
    return options;
};

export const useSukupuoliOptions = (locale: Locale) => {
    const data = useGetSukupuoletQuery().data ?? [];
    const options = useMemo(
        () =>
            data
                .map((koodi) => ({
                    value: koodi.koodiArvo.toLowerCase(),
                    label: localizeKoodiNimi(koodi, locale),
                }))
                .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
        [data, locale]
    );
    return options;
};

export const useKansalaisuusOptions = (locale: Locale) => {
    const data = useGetKansalaisuudetQuery().data ?? [];
    const options = useMemo(
        () =>
            data
                .map((koodi) => ({
                    value: koodi.koodiArvo.toLowerCase(),
                    label: localizeKoodiNimi(koodi, locale),
                }))
                .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
        [data, locale]
    );
    return options;
};

export const useKieliOptions = (locale: Locale) => {
    const data = useGetKieletQuery().data ?? [];
    const options = useMemo(
        () =>
            data
                .map((koodi) => ({
                    value: koodi.koodiArvo.toLowerCase(),
                    label: localizeKoodiNimi(koodi, locale),
                }))
                .sort((a, b) => a.label.localeCompare(b.label)) ?? [],
        [data, locale]
    );
    return options;
};

export const useRedirectByUser = (oid: string, allowedType: 'PALVELU' | 'VIRKAILIJA') => {
    const navigate = useNavigate();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(oid);
    useEffect(() => {
        if (omattiedot?.oidHenkilo === oid) {
            navigate('/omattiedot', { replace: true });
        }
        if (kayttajatiedot?.kayttajaTyyppi === 'PALVELU' && allowedType !== 'PALVELU') {
            navigate(`/jarjestelmatunnus/${oid}`, { replace: true });
        }
        if (kayttajatiedot?.kayttajaTyyppi === 'VIRKAILIJA' && allowedType !== 'VIRKAILIJA') {
            navigate(`/virkailija/${oid}`, { replace: true });
        }
    }, [omattiedot, kayttajatiedot, oid]);
};
