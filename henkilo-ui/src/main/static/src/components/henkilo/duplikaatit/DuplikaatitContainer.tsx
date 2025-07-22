import DuplikaatitPage from './DuplikaatitPage';
import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { RootState, useAppDispatch } from '../../../store';
import {
    fetchHenkilo,
    fetchKayttaja,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
} from '../../../actions/henkilo.actions';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';
import { henkiloViewTabs } from '../../navigation/NavigationTabs';
import { useSelector } from 'react-redux';
import { HenkiloState } from '../../../reducers/henkilo.reducer';

type OwnProps = {
    henkiloType?: string;
};

export const DuplikaatitContainer = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const params = useParams();
    const { L } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    useTitle(L['TITLE_DUPLIKAATTIHAKU']);
    useNavigation(henkiloViewTabs(params.oid, henkilo, props.henkiloType), true);

    useEffect(() => {
        const oidHenkilo = params.oid;
        dispatch<any>(fetchHenkilo(oidHenkilo));
        dispatch<any>(fetchKayttaja(oidHenkilo));
        dispatch<any>(fetchHenkiloMaster(oidHenkilo));
        dispatch<any>(fetchHenkiloDuplicates(oidHenkilo));
        dispatch<any>(fetchHenkiloHakemukset(oidHenkilo));
    }, []);

    return <DuplikaatitPage henkiloType={props.henkiloType} />;
};
