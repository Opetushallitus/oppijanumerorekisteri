import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../../store';
import { KayttooikeusryhmaPage } from './KayttooikeusryhmaPage';
import { fetchOppilaitostyypit, fetchOrganisaatiotyypit } from '../../../actions/koodisto.actions';
import { fetchKayttooikeusryhmaById, fetchKayttooikeusryhmaSlaves } from '../../../actions/kayttooikeusryhma.actions';
import Loader from '../../common/icons/Loader';
import { KoodistoState } from '../../../reducers/koodisto.reducer';
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
    const koodisto = useSelector<RootState, KoodistoState>((state) => state.koodisto);
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);

    useEffect(() => {
        const kayttooikeusryhmaId = params.id;
        dispatch<any>(fetchOppilaitostyypit());
        dispatch<any>(fetchOrganisaatiotyypit());
        if (kayttooikeusryhmaId) {
            dispatch<any>(fetchKayttooikeusryhmaById(kayttooikeusryhmaId));
            dispatch<any>(fetchKayttooikeusryhmaSlaves(kayttooikeusryhmaId));
        }
    }, []);

    return koodisto.oppilaitostyypitLoading ||
        koodisto.organisaatiotyyppiKoodistoLoading ||
        kayttooikeus.kayttooikeusryhmaLoading ||
        kayttooikeus.kayttooikeusryhmaSlavesLoading ? (
        <Loader />
    ) : (
        <KayttooikeusryhmaPage kayttooikeusryhmaId={params.id} />
    );
};
