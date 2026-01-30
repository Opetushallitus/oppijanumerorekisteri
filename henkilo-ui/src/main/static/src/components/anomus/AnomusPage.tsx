import React, { useState } from 'react';
import { SortingState } from '@tanstack/react-table';

import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { useLocalisations } from '../../selectors';
import {
    GetHaetutKayttooikeusryhmatRequest,
    useGetHaetutKayttooikeusryhmatInfiniteQuery,
    useGetOmattiedotQuery,
} from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';

const AnomusPage = () => {
    const { L } = useLocalisations();
    useTitle(L['TITLE_ANOMUKSET']);
    useNavigation(mainNavigation, false);
    const [sorted, setSorted] = useState<SortingState>([{ id: 'ANOTTU_PVM', desc: true }]);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [parameters, setParameters] = useState<GetHaetutKayttooikeusryhmatRequest>({
        orderBy: 'ANOTTU_PVM_DESC',
        limit: '20',
        showOwnAnomus: 'false',
        adminView: omattiedot?.isAdmin ? String(omattiedot?.isAdmin) : 'false',
        anomuksenTilat: 'ANOTTU',
        kayttoOikeudenTilas: KAYTTOOIKEUDENTILA.ANOTTU,
    });
    const { data, isLoading, fetchNextPage, hasNextPage } = useGetHaetutKayttooikeusryhmatInfiniteQuery(parameters);

    function onSubmit(criteria: Partial<GetHaetutKayttooikeusryhmatRequest>) {
        const newParameters = { ...parameters, ...criteria };
        newParameters.orderBy = sorted.length
            ? sorted[0]?.desc
                ? sorted[0]?.id + '_DESC'
                : sorted[0]?.id + '_ASC'
            : newParameters.orderBy;
        setParameters(newParameters);
    }

    return (
        <div className="mainContent wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1>{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</h1>
            <HaetutKayttooikeusRyhmatHakuForm onSubmit={onSubmit} />
            <HenkiloViewOpenKayttooikeusanomus
                isOmattiedot={false}
                anomukset={data?.pages.flat() ?? []}
                fetchMoreSettings={{
                    isActive: !isLoading && hasNextPage,
                    fetchMoreAction: () => fetchNextPage(),
                }}
                onSortingChange={(s) => s.length && setSorted([s[0]!])}
                tableLoading={isLoading}
                piilotaOtsikko={true}
            />
        </div>
    );
};

export default AnomusPage;
