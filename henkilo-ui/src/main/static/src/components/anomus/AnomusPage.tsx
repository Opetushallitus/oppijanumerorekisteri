import React, { useState } from 'react';
import { SortingState } from '@tanstack/react-table';

import '../../oph-table.css';
import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { getEmptyKayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { useLocalisations } from '../../selectors';
import { useAppDispatch } from '../../store';
import {
    GetHaetutKayttooikeusryhmatRequest,
    useGetHaetutKayttooikeusryhmatInfiniteQuery,
    useGetOmattiedotQuery,
} from '../../api/kayttooikeus';
import { addGlobalNotification } from '../../actions/notification.actions';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';

const AnomusPage = () => {
    const dispatch = useAppDispatch();
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
    const result = data?.pages.flat();

    function onSubmit(criteria: Partial<GetHaetutKayttooikeusryhmatRequest>) {
        const newParameters = { ...parameters, ...criteria };
        newParameters.orderBy = sorted.length
            ? sorted[0].desc
                ? sorted[0].id + '_DESC'
                : sorted[0].id + '_ASC'
            : newParameters.orderBy;
        setParameters(newParameters);
    }

    function createNotificationMessage(henkilo: HenkilonNimi, messageKey: string): string {
        const message = L[messageKey];
        const henkiloLocalized = L['HENKILO_KAYTTOOIKEUSANOMUS_NOTIFICATIONS_HENKILON'];
        const etunimet = henkilo.etunimet;
        const sukunimi = henkilo.sukunimi;
        const oid = henkilo.oid;
        return `${henkiloLocalized} ${etunimet} ${sukunimi} (${oid}) ${message}`;
    }

    return (
        <div className="mainContent wrapper">
            <h2 className="oph-h2 oph-bold">{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</h2>
            <div className="oph-table">
                <HaetutKayttooikeusRyhmatHakuForm onSubmit={onSubmit} />
                <HenkiloViewOpenKayttooikeusanomus
                    isOmattiedot={false}
                    kayttooikeus={{
                        ...getEmptyKayttooikeusRyhmaState(),
                        kayttooikeusAnomus: result,
                    }}
                    updateSuccessHandler={(id, henkilo, kayttoOikeudenTila) => {
                        const notificationMessageKey =
                            kayttoOikeudenTila === KAYTTOOIKEUDENTILA.HYLATTY
                                ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_SUCCESS'
                                : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_SUCCESS';
                        dispatch(
                            addGlobalNotification({
                                key: `${henkilo.oid}_${id}_${notificationMessageKey}`,
                                type: NOTIFICATIONTYPES.SUCCESS,
                                title: createNotificationMessage(henkilo, notificationMessageKey),
                                autoClose: 10000,
                            })
                        );
                    }}
                    updateErrorHandler={(id, henkilo, kayttoOikeudenTila) => {
                        const notificationMessageKey =
                            kayttoOikeudenTila === KAYTTOOIKEUDENTILA.HYLATTY
                                ? 'HENKILO_KAYTTOOIKEUSANOMUS_HYLKAYS_FAILURE'
                                : 'HENKILO_KAYTTOOIKEUSANOMUS_HYVAKSYMINEN_FAILURE';
                        addGlobalNotification({
                            key: `${henkilo.oid}_${id}_${notificationMessageKey}`,
                            type: NOTIFICATIONTYPES.ERROR,
                            title: createNotificationMessage(henkilo, notificationMessageKey),
                            autoClose: 10000,
                        });
                    }}
                    fetchMoreSettings={{
                        isActive: !isLoading && hasNextPage,
                        fetchMoreAction: () => fetchNextPage(),
                    }}
                    onSortingChange={(s) => s.length && setSorted([s[0]])}
                    tableLoading={isLoading}
                    piilotaOtsikko={true}
                />
            </div>
        </div>
    );
};

export default AnomusPage;
