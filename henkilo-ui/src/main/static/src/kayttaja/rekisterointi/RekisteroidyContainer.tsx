import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';

import { RekisteroidyPage } from './RekisteroidyPage';
import { fetchKieliKoodisto } from '../../actions/koodisto.actions';
import Loader from '../../components/common/icons/Loader';
import VirhePage from '../../components/common/page/VirhePage';
import { useAppDispatch, type KayttajaRootState } from '../store';
import type { KoodistoState } from '../../reducers/koodisto.reducer';
import { useLocalisations } from '../../selectors';
import { useGetKutsuByTokenQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';

const RekisteroidyContainer = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const { l10n } = useLocalisations();
    const koodisto = useSelector<KayttajaRootState, KoodistoState>((state) => state.koodisto);
    const search = new URLSearchParams(location.search);
    const temporaryToken = search.get('temporaryKutsuToken');
    const { data: kutsu, isLoading: isKutsuLoading, isError } = useGetKutsuByTokenQuery(temporaryToken);
    const locale = toSupportedLocale(kutsu?.asiointikieli);
    const L = l10n.localisations[locale];

    useTitle(L['TITLE_REKISTEROINTI']);

    useEffect(() => {
        dispatch<any>(fetchKieliKoodisto());
    }, []);

    if (koodisto.kieliKoodistoLoading || isKutsuLoading) {
        return <Loader />;
    } else if (isError) {
        return <VirhePage text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
    }
    return <RekisteroidyPage koodisto={koodisto} kutsu={{ ...kutsu, temporaryToken }} L={L} locale={locale} />;
};

export default RekisteroidyContainer;
