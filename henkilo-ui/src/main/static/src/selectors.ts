import { Localisations, L10n } from './types/localisation.type';
import { Locale } from './types/locale.type';
import {
    useGetKayttooikeusryhmasForHenkiloQuery,
    useGetOmatKayttooikeusryhmasQuery,
    useGetOmatOrganisaatiotQuery,
    useGetOmattiedotQuery,
} from './api/kayttooikeus';
import { Localisation, useGetLocalisationsQuery } from './api/lokalisointi';
import { useGetLocaleQuery } from './api/oppijanumerorekisteri';
import { useMemo } from 'react';

export function toSupportedLocale(anyLocale: string): Locale {
    const locale = anyLocale?.toLocaleLowerCase();
    if (locale === 'fi' || locale === 'sv') {
        return locale;
    } else {
        return 'fi';
    }
}

const mapLocalisationsByLocale = (localisations: Localisation[]): L10n => {
    const result = { fi: {}, sv: {}, en: {} };
    localisations?.forEach((localisation) => {
        try {
            result[localisation.locale][localisation.key] = localisation.value;
        } catch {
            // nop, survive malformed data from localization service
        }
    });
    return result;
};

export const useLocalisations = (): {
    L: Localisations;
    locale: Locale;
    allLocalisations: L10n;
    getLocalisations: (l: string) => Localisations;
} => {
    const { data: locale } = useGetLocaleQuery();
    const supportedLocale = toSupportedLocale(locale);
    const { data: localisations } = useGetLocalisationsQuery('henkilo-ui');
    const { L, allLocalisations, getLocalisations } = useMemo(() => {
        const allLocalisations = mapLocalisationsByLocale(localisations);
        const L = allLocalisations?.[supportedLocale];
        const getLocalisations = (l: string) => allLocalisations?.[toSupportedLocale(l)];
        return { L, allLocalisations, getLocalisations };
    }, [localisations, supportedLocale]);
    return { L, locale: supportedLocale, allLocalisations, getLocalisations };
};

export const useOmatOrganisaatiot = () => {
    const { locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: omatOrganisaatiot } = useGetOmatOrganisaatiotQuery({ oid: omattiedot.oidHenkilo, locale });
    return omatOrganisaatiot;
};

export const useKayttooikeusryhmas = (isOmattiedot: boolean, henkiloOid?: string) => {
    const kayttooikeusryhmas = useGetKayttooikeusryhmasForHenkiloQuery(henkiloOid, { skip: isOmattiedot });
    const omatKayttooikeusryhma = useGetOmatKayttooikeusryhmasQuery(undefined, { skip: !isOmattiedot });
    return isOmattiedot ? omatKayttooikeusryhma : kayttooikeusryhmas;
};
