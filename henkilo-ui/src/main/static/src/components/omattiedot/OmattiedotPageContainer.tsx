import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch, type RootState } from '../../store';
import { fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, clearHenkilo } from '../../actions/henkilo.actions';
import {
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
} from '../../actions/kayttooikeusryhma.actions';
import {
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchYhteystietotyypitKoodisto,
} from '../../actions/koodisto.actions';
import {
    fetchAllHierarchialOrganisaatios,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
} from '../../actions/organisaatio.actions';
import HenkiloViewPage from '../henkilo/HenkiloViewPage';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import Loader from '../common/icons/Loader';

const OmattiedotPageContainer = () => {
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch<any>(fetchYhteystietotyypitKoodisto());
        dispatch<any>(fetchKieliKoodisto());
        dispatch<any>(fetchKansalaisuusKoodisto());
        dispatch<any>(fetchAllOrganisaatios());
        dispatch<any>(fetchAllRyhmas());
        dispatch<any>(fetchAllHierarchialOrganisaatios());
    }, []);

    useEffect(() => {
        if (omattiedot.data?.oid) {
            const userOid = omattiedot.data?.oid;
            dispatch<any>(clearHenkilo());
            dispatch<any>(fetchHenkilo(userOid));
            dispatch<any>(fetchKayttajatieto(userOid));
            dispatch<any>(fetchHenkiloOrgs(userOid));
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo()); // For current user
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(userOid));
        }
    }, [omattiedot]);

    if (omattiedot.data?.oid === henkilo.henkilo.oidHenkilo) {
        return <HenkiloViewPage oidHenkilo={omattiedot.data.oid} view="omattiedot" />;
    } else {
        return <Loader />;
    }
};

export default OmattiedotPageContainer;
