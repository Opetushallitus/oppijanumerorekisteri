import { useSelector } from 'react-redux';
import { RootState } from './store';
import { Localisations } from './types/localisation.type';
import { Locale } from './types/locale.type';
import { LocalisationState } from './reducers/l10n.reducer';

export const useLocalisations = () =>
    useSelector<RootState, { L: Localisations; locale: Locale; l10n: LocalisationState }>((state) => ({
        L: state.l10n.localisations[state.locale],
        locale: state.locale,
        l10n: state.l10n,
    }));
