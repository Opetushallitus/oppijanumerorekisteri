import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from './store';
import { Localisations } from './types/localisation.type';
import { Locale } from './types/locale.type';
import { LocalisationState } from './reducers/l10n.reducer';
import {
    useGetKayttooikeusryhmasForHenkiloQuery,
    useGetOmatKayttooikeusryhmasQuery,
    useGetOmatOrganisaatiotQuery,
    useGetOmattiedotQuery,
} from './api/kayttooikeus';

export const useLocalisations = () =>
    useSelector<RootState, { L: Localisations; locale: Locale; l10n: LocalisationState }>(
        (state) => ({
            L: state.l10n.localisations[state.locale],
            locale: state.locale,
            l10n: state.l10n,
        }),
        shallowEqual
    );

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
