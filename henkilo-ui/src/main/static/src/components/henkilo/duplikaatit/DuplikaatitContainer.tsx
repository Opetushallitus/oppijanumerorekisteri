import DuplikaatitPage from './DuplikaatitPage';
import React, { useEffect } from 'react';

import { RootState, useAppDispatch } from '../../../store';
import {
    fetchHenkilo,
    fetchKayttaja,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
} from '../../../actions/henkilo.actions';
import {
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
} from '../../../actions/koodisto.actions';
import { RouteType } from '../../../routes';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';
import { henkiloViewTabs } from '../../navigation/NavigationTabs';
import { useSelector } from 'react-redux';
import { HenkiloState } from '../../../reducers/henkilo.reducer';

type OwnProps = {
    params: { oid?: string; henkiloType?: string };
    route: RouteType;
};

export const DuplikaatitContainer = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    useTitle(L['TITLE_DUPLIKAATTIHAKU']);
    useNavigation(henkiloViewTabs(props.params.oid, henkilo, props.params.henkiloType), true);

    useEffect(() => {
        const oidHenkilo = props.params.oid;
        dispatch<any>(fetchHenkilo(oidHenkilo));
        dispatch<any>(fetchKayttaja(oidHenkilo));
        dispatch<any>(fetchKansalaisuusKoodisto());
        dispatch<any>(fetchMaatJaValtiotKoodisto());
        dispatch<any>(fetchKieliKoodisto());
        dispatch<any>(fetchHenkiloMaster(oidHenkilo));
        dispatch<any>(fetchHenkiloDuplicates(oidHenkilo));
        dispatch<any>(fetchHenkiloHakemukset(oidHenkilo));
    }, []);

    return <DuplikaatitPage henkiloType={props.route.henkiloType} />;
};
