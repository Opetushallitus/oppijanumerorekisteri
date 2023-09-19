import React, { useEffect } from 'react';
import { useAppDispatch } from '../../store';
import HenkiloViewPage from '../../components/henkilo/HenkiloViewPage';
import {
    fetchKayttaja,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKayttajatieto,
    clearHenkilo,
    fetchHenkiloSlaves,
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
    getGrantablePrivileges,
} from '../../actions/kayttooikeusryhma.actions';

type Props = {
    oidHenkilo: string;
};

const VirkailijaViewContainer = ({ oidHenkilo }: Props) => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const fetchAllData = async () => {
            dispatch<any>(clearHenkilo());
            await dispatch<any>(fetchHenkilo(oidHenkilo));
            dispatch<any>(fetchHenkiloYksilointitieto(oidHenkilo));
            dispatch<any>(fetchHenkiloOrgs(oidHenkilo));
            dispatch<any>(fetchHenkiloSlaves(oidHenkilo));
            dispatch<any>(fetchKieliKoodisto());
            dispatch<any>(fetchKansalaisuusKoodisto());
            dispatch<any>(fetchKayttaja(oidHenkilo));
            dispatch<any>(fetchKayttajatieto(oidHenkilo));
            dispatch<any>(fetchYhteystietotyypitKoodisto());
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oidHenkilo));
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(oidHenkilo));
            dispatch<any>(getGrantablePrivileges(oidHenkilo));
        };
        fetchAllData();
    }, [oidHenkilo]);

    return <HenkiloViewPage oidHenkilo={oidHenkilo} view="VIRKAILIJA" />;
};

export default VirkailijaViewContainer;
