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

type HenkiloType = 'virkailija' | 'oppija';

type OwnProps = {
    router: RouteActions;
    params: { oid?: string; henkiloType?: string };
    henkiloType: HenkiloType;
};

const getView = (henkiloType: HenkiloType, omattiedot: OmattiedotState): View => {
    if (omattiedot.isAdmin) {
        return 'admin';
    } else {
        return henkiloType;
    }
};

/*
 * Henkilo-näkymä. Päätellään näytetäänkö admin/virkailija/oppija -versio henkilöstä, vai siirrytäänkö omattiedot-sivulle
 */
const HenkiloViewContainer = ({ router, henkiloType, params }: OwnProps) => {
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const { oid } = params;
    const dispatch = useAppDispatch();

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

    if (!omattiedot.data || omattiedot.omattiedotLoading) {
        return <Loader />;
    } else {
        return <HenkiloViewPage oidHenkilo={oid} view={view} />;
    }
};

export default HenkiloViewContainer;
