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
import { HenkiloViewPage } from '../henkilo/HenkiloViewPage';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import Loader from '../common/icons/Loader';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';

const OmattiedotPageContainer = () => {
    const { data: omattiedot } = useGetOmattiedotQuery();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch<any>(fetchYhteystietotyypitKoodisto());
        dispatch<any>(fetchKieliKoodisto());
        dispatch<any>(fetchKansalaisuusKoodisto());

        if (omattiedot.oidHenkilo) {
            const userOid = omattiedot.oidHenkilo;
            dispatch<any>(clearHenkilo());
            dispatch<any>(fetchHenkilo(userOid));
            dispatch<any>(fetchKayttajatieto(userOid));
            dispatch<any>(fetchHenkiloOrgs(userOid));
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo()); // For current user
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(userOid));
        }
    }, []);

    if (omattiedot.oidHenkilo === henkilo.henkilo.oidHenkilo) {
        return <HenkiloViewPage oidHenkilo={omattiedot.oidHenkilo} view="omattiedot" />;
    } else {
        return <Loader />;
    }
};

export default OmattiedotPageContainer;
