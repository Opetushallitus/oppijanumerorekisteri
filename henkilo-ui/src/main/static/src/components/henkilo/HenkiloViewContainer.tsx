import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouteActions } from 'react-router-redux';

import { useAppDispatch, type RootState } from '../../store';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import Loader from '../common/icons/Loader';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';
import {
    fetchKansalaisuusKoodisto,
    fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto,
} from '../../actions/koodisto.actions';
import {
    clearHenkilo,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchHenkiloSlaves,
    fetchHenkiloYksilointitieto,
    fetchKayttaja,
    fetchKayttajatieto,
} from '../../actions/henkilo.actions';
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
} from '../../actions/kayttooikeusryhma.actions';
import HenkiloViewPage, { View } from './HenkiloViewPage';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { useLocalisations } from '../../selectors';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';

type OwnProps = {
    router: RouteActions;
    location: { pathname: string };
    params: { oid?: string; henkiloType?: string };
};

const getView = (henkiloType: string, omattiedot: OmattiedotState): View => {
    if (omattiedot.isAdmin) {
        return 'admin';
    } else if (henkiloType === 'virkailija' || henkiloType === 'oppija') {
        return henkiloType;
    }
    return null;
};

/*
 * Henkilo-näkymä. Päätellään näytetäänkö admin/virkailija/oppija -versio henkilöstä, vai siirrytäänkö omattiedot-sivulle
 */
const HenkiloViewContainer = ({ router, location, params }: OwnProps) => {
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { L } = useLocalisations();
    const { oid } = params;
    const dispatch = useAppDispatch();

    const henkiloType = location.pathname.split('/')[1];
    const view = getView(henkiloType, omattiedot);

    useEffect(() => {
        dispatch<any>(fetchOmattiedot());
        if (oid && omattiedot.data?.oid === oid) {
            router.replace('/omattiedot');
        }

        dispatch<any>(clearHenkilo());
        dispatch<any>(fetchHenkilo(oid));
        dispatch<any>(fetchHenkiloYksilointitieto(oid));
        dispatch<any>(fetchHenkiloSlaves(oid));
        dispatch<any>(fetchYhteystietotyypitKoodisto());
        dispatch<any>(fetchKieliKoodisto());
        dispatch<any>(fetchKansalaisuusKoodisto());

        if (view === 'admin' || view === 'virkailija') {
            dispatch<any>(fetchHenkiloOrgs(oid));
            dispatch<any>(fetchKayttaja(oid));
            dispatch<any>(fetchKayttajatieto(oid));
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oid));
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(oid));
        }
    }, [omattiedot, oid, view]);

    if (!omattiedot.data || omattiedot.omattiedotLoading || !view) {
        return <Loader />;
    } else if (henkilo.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={L} />;
    } else if (view) {
        return <HenkiloViewPage oidHenkilo={oid} view={view} />;
    } else {
        return <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={L['HENKILO_SIVU_VIRHE']} toggle={true} />;
    }
};

export default HenkiloViewContainer;
