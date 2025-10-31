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
import { useGetKieletQuery } from './api/koodisto';
import StaticUtils from './components/common/StaticUtils';

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
    skipUserLocale: boolean = false
): {
    L: Localisations;
    locale: Locale;
    allLocalisations: L10n;
    getLocalisations: (l?: string) => Localisations;
} => {
    const { data: locale } = useGetLocaleQuery(undefined, { skip: skipUserLocale });
    const supportedLocale = toSupportedLocale(locale);
    const { data: localisations } = useGetLocalisationsQuery('henkilo-ui');
    const { L, allLocalisations, getLocalisations } = useMemo(() => {
        const allLocalisations = mapLocalisationsByLocale(localisations);
        const L = allLocalisations?.[supportedLocale];
        const getLocalisations = (l?: string) => allLocalisations?.[toSupportedLocale(l)];
        return { L, allLocalisations, getLocalisations };
    }, [localisations, supportedLocale]);
    return { L, locale: supportedLocale, allLocalisations, getLocalisations };
};

export const useOmatOrganisaatiot = () => {
    const { locale } = useLocalisations();
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: omatOrganisaatiot } = useGetOmatOrganisaatiotQuery(
        { oid: omattiedot!.oidHenkilo, locale },
        { skip: !omattiedot }
    );
    return omatOrganisaatiot;
};

export const useKayttooikeusryhmas = (isOmattiedot: boolean, henkiloOid?: string) => {
    const kayttooikeusryhmas = useGetKayttooikeusryhmasForHenkiloQuery(henkiloOid!, { skip: isOmattiedot });
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
                label: StaticUtils.localizeKoodiNimi(koodi, locale),
                optionsName: 'asiointiKieli.kieliKoodi',
            })) ?? []
        );
    }, [kielet]);
    return options;
};
