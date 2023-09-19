import React, { useEffect } from 'react';

import { useAppDispatch } from '../../store';
import {
    clearHenkilo,
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchHenkiloYksilointitieto,
} from '../../actions/henkilo.actions';
import {
    fetchKansalaisuusKoodisto,
    fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto,
} from '../../actions/koodisto.actions';
import HenkiloViewPage from './HenkiloViewPage';

type Props = {
    oidHenkilo: string;
};

const OppijaViewContainer = ({ oidHenkilo }: Props) => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        const fetchAllData = async () => {
            dispatch<any>(clearHenkilo());
            await dispatch<any>(fetchHenkilo(oidHenkilo));
            dispatch<any>(fetchHenkiloYksilointitieto(oidHenkilo));
            dispatch<any>(fetchHenkiloSlaves(oidHenkilo));
            dispatch<any>(fetchYhteystietotyypitKoodisto());
            dispatch<any>(fetchKieliKoodisto());
            dispatch<any>(fetchKansalaisuusKoodisto());
        };
        fetchAllData();
    }, [oidHenkilo]);

    return <HenkiloViewPage oidHenkilo={oidHenkilo} view="OPPIJA" />;
};

export default OppijaViewContainer;
