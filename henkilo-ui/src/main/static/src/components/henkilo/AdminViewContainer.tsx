import React, { useEffect } from 'react';
import { useAppDispatch } from '../../store';
import {
    fetchKayttaja,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKayttajatieto,
    fetchHenkiloSlaves,
    clearHenkilo,
    fetchHenkiloYksilointitieto,
} from '../../actions/henkilo.actions';
import {
    fetchKansalaisuusKoodisto,
    fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto,
} from '../../actions/koodisto.actions';
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
} from '../../actions/kayttooikeusryhma.actions';
import HenkiloViewPage from './HenkiloViewPage';

type Props = {
    oidHenkilo: string;
};

const AdminViewContainer = ({ oidHenkilo }: Props) => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const fetchAllData = async () => {
            dispatch<any>(clearHenkilo());
            await dispatch<any>(fetchHenkilo(oidHenkilo));
            dispatch<any>(fetchHenkiloOrgs(oidHenkilo));
            dispatch<any>(fetchHenkiloSlaves(oidHenkilo));
            dispatch<any>(fetchHenkiloYksilointitieto(oidHenkilo));
            dispatch<any>(fetchKieliKoodisto());
            dispatch<any>(fetchKansalaisuusKoodisto());
            dispatch<any>(fetchKayttaja(oidHenkilo));
            dispatch<any>(fetchKayttajatieto(oidHenkilo));
            dispatch<any>(fetchYhteystietotyypitKoodisto());
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo));
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(oidHenkilo));
        };
        fetchAllData();
    }, [oidHenkilo]);

    return <HenkiloViewPage oidHenkilo={oidHenkilo} view="ADMIN" />;
};

export default AdminViewContainer;
