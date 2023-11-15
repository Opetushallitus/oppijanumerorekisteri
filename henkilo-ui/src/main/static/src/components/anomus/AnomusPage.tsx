import React, { useEffect, useState } from 'react';
import { SortingState } from '@tanstack/react-table';

import '../../oph-table.css';
import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { KAYTTOOIKEUDENTILA, KayttooikeudenTila } from '../../globals/KayttooikeudenTila';
import { getEmptyKayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { HenkilonNimi } from '../../types/domain/kayttooikeus/HenkilonNimi';
import { useLocalisations } from '../../selectors';
import { fetchAllOrganisaatios, fetchAllRyhmas } from '../../actions/organisaatio.actions';
import { useAppDispatch } from '../../store';
import {
    GetHaetutKayttooikeusryhmatRequest,
    useGetHaetutKayttooikeusryhmatQuery,
    useGetOmattiedotQuery,
    usePutHaettuKayttooikeusryhmaMutation,
} from '../../api/kayttooikeus';
import { addGlobalNotification } from '../../actions/notification.actions';

const AnomusPage = () => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const [sorted, setSorted] = useState<SortingState>([{ id: 'ANOTTU_PVM', desc: true }]);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const [parameters, setParameters] = useState<GetHaetutKayttooikeusryhmatRequest>({
        orderBy: 'ANOTTU_PVM_DESC',
        limit: '20',
        showOwnAnomus: 'false',
        adminView: omattiedot?.isAdmin ? String(omattiedot?.isAdmin) : 'false',
        anomuksenTilat: 'ANOTTU',
        kayttoOikeudenTilas: KAYTTOOIKEUDENTILA.ANOTTU,
        offset: '0',
    });
    const { data, isLoading } = useGetHaetutKayttooikeusryhmatQuery(parameters);
    const [putHaettuKayttooikeusryhma] = usePutHaettuKayttooikeusryhmaMutation();

    useEffect(() => {
        dispatch<any>(fetchAllRyhmas());
        dispatch<any>(fetchAllOrganisaatios());
    }, []);

    function onSubmit(criteria: Partial<GetHaetutKayttooikeusryhmatRequest>) {
        const newParameters = Object.assign({}, parameters, criteria);
        newParameters.orderBy = sorted.length
            ? sorted[0].desc
                ? sorted[0].id + '_DESC'
                : sorted[0].id + '_ASC'
            : newParameters.orderBy;
        newParameters.offset = '0';
        setParameters(newParameters);
    }

    function updateHaettuKayttooikeusryhma(
        id: number,
        kayttoOikeudenTila: KayttooikeudenTila,
        alkupvm: string,
        loppupvm: string | undefined,
        henkilo: HenkilonNimi,
        hylkaysperuste?: string
    ): void {
        putHaettuKayttooikeusryhma({ id, kayttoOikeudenTila, alkupvm, loppupvm, hylkaysperuste })
            .unwrap()
            .then(() => {
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
            })
            .catch(() => {
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
            });
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
                        kayttooikeusAnomus: data,
                        grantableKayttooikeus: {},
                        grantableKayttooikeusLoading: true,
                    }}
                    updateHaettuKayttooikeusryhmaAlt={updateHaettuKayttooikeusryhma}
                    fetchMoreSettings={{
                        isActive: !isLoading && data?.length === Number(parameters.offset) + 20,
                        fetchMoreAction: () =>
                            setParameters({ ...parameters, offset: String(Number(parameters.offset) + 20) }),
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
