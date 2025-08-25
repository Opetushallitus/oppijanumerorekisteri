import React from 'react';
import { useLocation } from 'react-router';

import { RekisteroidyPage } from './RekisteroidyPage';
import Loader from '../../components/common/icons/Loader';
import VirhePage from '../../components/common/page/VirhePage';
import { useLocalisations } from '../../selectors';
import { useGetKutsuByTokenQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';

const RekisteroidyContainer = () => {
    const location = useLocation();
    const { l10n } = useLocalisations();
    const search = new URLSearchParams(location.search);
    const temporaryToken = search.get('temporaryKutsuToken');
    const { data: kutsu, isLoading: isKutsuLoading, isError } = useGetKutsuByTokenQuery(temporaryToken);
    const locale = toSupportedLocale(kutsu?.asiointikieli);
    const L = l10n.localisations[locale];

    useTitle(L['TITLE_REKISTEROINTI']);

    if (isKutsuLoading) {
        return <Loader />;
    } else if (isError) {
        return <VirhePage text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
    }
    return <RekisteroidyPage kutsu={{ ...kutsu, temporaryToken }} L={L} locale={locale} />;
};

export default RekisteroidyContainer;
