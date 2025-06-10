import { useSelector, shallowEqual } from 'react-redux';
import { RootState } from './store';
import { Localisations } from './types/localisation.type';
import { Locale } from './types/locale.type';
import { LocalisationState } from './reducers/l10n.reducer';
import { useGetOmatOrganisaatiotQuery, useGetOmattiedotQuery } from './api/kayttooikeus';

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
