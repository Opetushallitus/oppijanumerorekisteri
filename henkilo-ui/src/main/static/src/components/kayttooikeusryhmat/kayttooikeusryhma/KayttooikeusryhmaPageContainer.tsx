import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../../store';
import { KayttooikeusryhmaPage } from './KayttooikeusryhmaPage';
import { fetchKayttooikeusryhmaById, fetchKayttooikeusryhmaSlaves } from '../../../actions/kayttooikeusryhma.actions';
import Loader from '../../common/icons/Loader';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';

export const KayttooikeusryhmaPageContainer = () => {
    const dispatch = useAppDispatch();
    const params = useParams();
    const { L } = useLocalisations();
    useTitle(L['TITLE_KAYTTO_OIKEUSRYHMA']);
    useNavigation([], true);
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);

    useEffect(() => {
        const kayttooikeusryhmaId = params.id;
        if (kayttooikeusryhmaId) {
            dispatch<any>(fetchKayttooikeusryhmaById(kayttooikeusryhmaId));
            dispatch<any>(fetchKayttooikeusryhmaSlaves(kayttooikeusryhmaId));
        }
    }, []);

    return kayttooikeus.kayttooikeusryhmaLoading || kayttooikeus.kayttooikeusryhmaSlavesLoading ? (
        <Loader />
    ) : (
        <KayttooikeusryhmaPage kayttooikeusryhmaId={params.id} />
    );
};
