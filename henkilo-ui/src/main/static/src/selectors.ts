import { useSelector } from 'react-redux';
import { RootState } from './store';
import { Localisations } from './types/localisation.type';
import { Locale } from './types/locale.type';

export const useLocalisations = () =>
    useSelector<RootState, { L: Localisations; locale: Locale }>((state) => ({
        L: state.l10n.localisations[state.locale],
        locale: state.locale,
    }));
