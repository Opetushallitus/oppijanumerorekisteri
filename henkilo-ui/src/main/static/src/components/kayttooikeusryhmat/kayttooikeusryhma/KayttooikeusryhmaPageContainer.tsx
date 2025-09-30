import React from 'react';
import { useParams } from 'react-router';

import { KayttooikeusryhmaPage } from './KayttooikeusryhmaPage';
import Loader from '../../common/icons/Loader';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';
import { useGetKayttooikeusryhmaMyontoviiteQuery, useGetKayttooikeusryhmaQuery } from '../../../api/kayttooikeus';

export const KayttooikeusryhmaPageContainer = () => {
    const params = useParams();
    const { L } = useLocalisations();
    const { isLoading: isKayttooikeusryhmaLoading } = useGetKayttooikeusryhmaQuery(params.id, { skip: !params.id });
    const { isLoading: isKayttooikeusryhmaMyontoviiteLoading } = useGetKayttooikeusryhmaMyontoviiteQuery(params.id, {
        skip: !params.id,
    });

    useTitle(L['TITLE_KAYTTO_OIKEUSRYHMA']);
    useNavigation([], true);

    return isKayttooikeusryhmaLoading || isKayttooikeusryhmaMyontoviiteLoading ? (
        <Loader />
    ) : (
        <KayttooikeusryhmaPage kayttooikeusryhmaId={params.id} />
    );
};
