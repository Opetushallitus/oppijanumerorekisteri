import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SortingState } from '@tanstack/react-table';

import '../../oph-table.css';
import HaetutKayttooikeusRyhmatHakuForm, { Criteria } from './HaetutKayttooikeusRyhmatHakuForm';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { KAYTTOOIKEUDENTILA } from '../../globals/KayttooikeudenTila';
import { getEmptyKayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { HaettuKayttooikeusryhma } from '../../types/domain/kayttooikeus/HaettuKayttooikeusryhma.types';
import { useLocalisations } from '../../selectors';
import { clearHaetutKayttooikeusryhmat, fetchHaetutKayttooikeusryhmat } from '../../actions/anomus.actions';
import { fetchAllOrganisaatios, fetchAllRyhmas } from '../../actions/organisaatio.actions';
import { RootState, useAppDispatch } from '../../store';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { addGlobalNotification } from '../../actions/notification.actions';
import {
    clearHaettuKayttooikeusryhma,
    updateHaettuKayttooikeusryhmaInAnomukset,
} from '../../actions/kayttooikeusryhma.actions';

export type FetchHaetutKayttooikeusryhmatParameters = {
    orderBy: string;
    limit: number;
    showOwnAnomus: boolean;
    adminView: boolean;
    anomuksenTilat: Array<string>;
    kayttoOikeudenTilas: Array<string>;
    offset?: number;
};

const AnomusPage = () => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const [sorted, setSorted] = useState<SortingState>([{ id: 'ANOTTU_PVM', desc: true }]);
    const [page, setPage] = useState(0);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const kayttooikeusAnomus = useSelector<RootState, HaettuKayttooikeusryhma[]>(
        (state) => state.haetutKayttooikeusryhmat.data
    );
    const haetutKayttooikeusryhmatLoading = useSelector<RootState, boolean>(
        (state) => state.haetutKayttooikeusryhmat.isLoading
    );
    const [allFetched, setAllFetched] = useState(false);
    const [parameters, setParameters] = useState<FetchHaetutKayttooikeusryhmatParameters>({
        orderBy: 'ANOTTU_PVM_DESC',
        limit: 20,
        showOwnAnomus: false,
        adminView: omattiedot?.isAdmin,
        anomuksenTilat: ['ANOTTU'],
        kayttoOikeudenTilas: [KAYTTOOIKEUDENTILA.ANOTTU],
    });

    useEffect(() => {
        dispatch<any>(fetchHaetutKayttooikeusryhmat(parameters));
        dispatch<any>(fetchAllRyhmas());
        dispatch<any>(fetchAllOrganisaatios());
    }, []);

    useEffect(() => {
        if (!haetutKayttooikeusryhmatLoading) {
            setAllFetched(kayttooikeusAnomus.length < 20 * (page + 1));
        }
    }, [kayttooikeusAnomus, haetutKayttooikeusryhmatLoading]);

    function onSortingChange(sorting: SortingState) {
        setSorted([sorting[0]]);
    }

    function onSubmitWithoutClear(criteria?: Criteria) {
        onSubmit(criteria, true);
    }

    function onSubmit(criteria?: Criteria, shouldNotClear?: boolean) {
        if (!shouldNotClear) {
            dispatch(clearHaetutKayttooikeusryhmat());
        }
        const newParameters = Object.assign({}, parameters, criteria);
        newParameters.orderBy = sorted.length
            ? sorted[0].desc
                ? sorted[0].id + '_DESC'
                : sorted[0].id + '_ASC'
            : newParameters.orderBy;
        newParameters.offset = shouldNotClear ? 20 * (page + 1) : 0;
        setParameters(newParameters);
        setPage(shouldNotClear ? page + 1 : 0);
        setAllFetched(shouldNotClear ? allFetched : false);
        dispatch<any>(fetchHaetutKayttooikeusryhmat(newParameters));
    }

    function updateHaettuKayttooikeusryhma(
        id: number,
        kayttoOikeudenTila: string,
        alkupvm: string,
        loppupvm: string,
        henkilo: HenkilonNimi,
        hylkaysperuste?: string
    ): void {
        try {
            dispatch<any>(
                updateHaettuKayttooikeusryhmaInAnomukset(id, kayttoOikeudenTila, alkupvm, loppupvm, hylkaysperuste)
            );
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
            dispatch(clearHaettuKayttooikeusryhma(id));
        } catch (error) {
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
            throw error;
        }
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
        <div className="wrapper">
            <span className="oph-h2 oph-bold">{L['HENKILO_AVOIMET_KAYTTOOIKEUDET_OTSIKKO']}</span>
            <div className="oph-table">
                <HaetutKayttooikeusRyhmatHakuForm onSubmit={onSubmit} />
                <HenkiloViewOpenKayttooikeusanomus
                    isOmattiedot={false}
                    kayttooikeus={{
                        ...getEmptyKayttooikeusRyhmaState(),
                        kayttooikeusAnomus,
                        grantableKayttooikeus: {},
                        grantableKayttooikeusLoading: true,
                    }}
                    updateHaettuKayttooikeusryhmaAlt={updateHaettuKayttooikeusryhma}
                    fetchMoreSettings={{
                        isActive: !allFetched && !haetutKayttooikeusryhmatLoading,
                        fetchMoreAction: onSubmitWithoutClear,
                    }}
                    onSortingChange={onSortingChange}
                    tableLoading={haetutKayttooikeusryhmatLoading}
                    piilotaOtsikko={true}
                />
            </div>
        </div>
    );
};

export default AnomusPage;
