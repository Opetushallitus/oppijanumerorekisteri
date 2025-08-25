import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../store';
import Loader from '../common/icons/Loader';
import { fetchYhteystietotyypitKoodisto } from '../../actions/koodisto.actions';
import {
    clearHenkilo,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchHenkiloYksilointitieto,
    fetchKayttaja,
    fetchKayttajatieto,
} from '../../actions/henkilo.actions';
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
} from '../../actions/kayttooikeusryhma.actions';
import { HenkiloViewPage, View } from './HenkiloViewPage';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { useLocalisations } from '../../selectors';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { Omattiedot } from '../../types/domain/kayttooikeus/Omattiedot.types';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { henkiloViewTabs } from '../navigation/NavigationTabs';
import { useGetHenkiloMasterQuery } from '../../api/oppijanumerorekisteri';

const getView = (henkiloType: string, omattiedot: Omattiedot): View => {
    if (omattiedot.isAdmin) {
        return 'admin';
    } else if (henkiloType === 'virkailija' || henkiloType === 'oppija') {
        return henkiloType;
    }
    return null;
};

const titles = {
    oppija: 'TITLE_OPPIJA',
    virkailija: 'TITLE_VIRKAILIJA',
    admin: 'TITLE_ADMIN',
};

/*
 * Henkilo-näkymä. Päätellään näytetäänkö admin/virkailija/oppija -versio henkilöstä, vai siirrytäänkö omattiedot-sivulle
 */
const HenkiloViewContainer = () => {
    const { data: omattiedot } = useGetOmattiedotQuery();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { L } = useLocalisations();
    const { oid } = useParams();
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const henkiloType = location.pathname.split('/')[1];
    const view = getView(henkiloType, omattiedot);
    useTitle(L[titles[henkiloType ?? 'oppija']]);
    useNavigation(henkiloViewTabs(oid, henkilo, henkiloType, master?.oidHenkilo), true);

    useEffect(() => {
        if (oid && omattiedot.oidHenkilo === oid) {
            navigate('/omattiedot', { replace: true });
        }

        dispatch<any>(clearHenkilo());
        dispatch<any>(fetchHenkilo(oid));
        dispatch<any>(fetchHenkiloYksilointitieto(oid));
        dispatch<any>(fetchYhteystietotyypitKoodisto());

        if (view === 'admin' || view === 'virkailija') {
            dispatch<any>(fetchHenkiloOrgs(oid));
            dispatch<any>(fetchKayttaja(oid));
            dispatch<any>(fetchKayttajatieto(oid));
            dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(oid));
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(oid));
        }
    }, [omattiedot, oid, view]);

    if (!view) {
        return <Loader />;
    } else if (henkilo.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={L} />;
    } else if (view) {
        return <HenkiloViewPage oidHenkilo={oid} view={view} />;
    } else {
        return <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={L['HENKILO_SIVU_VIRHE']} toggle={true} />;
    }
};

export default HenkiloViewContainer;
