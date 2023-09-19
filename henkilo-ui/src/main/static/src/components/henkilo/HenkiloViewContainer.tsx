import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouteActions } from 'react-router-redux';

import { useAppDispatch, type RootState } from '../../store';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import AdminViewContainer from './AdminViewContainer';
import VirkailijaViewContainer from './VirkailijaViewContainer';
import OppijaViewContainer from './OppijaViewContainer';
import { LocalNotification } from '../common/Notification/LocalNotification';
import { NOTIFICATIONTYPES } from '../common/Notification/notificationtypes';
import { L10n } from '../../types/localisation.type';
import { Locale } from '../../types/locale.type';
import Loader from '../common/icons/Loader';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';

type OwnProps = {
    router: RouteActions;
    location: { pathname: string };
    params: { oid?: string; henkiloType?: string };
};

/*
 * Henkilo-näkymä. Päätellään näytetäänkö admin/virkailija/oppija -versio henkilöstä, vai siirrytäänkö omattiedot-sivulle
 */
const HenkiloViewContainer = ({ router, location, params }: OwnProps) => {
    const l10n = useSelector<RootState, L10n>((state) => state.l10n.localisations);
    const locale = useSelector<RootState, Locale>((state) => state.locale);
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const { oid, henkiloType } = params;
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch<any>(fetchOmattiedot());
        if (oid && omattiedot.data?.oid && omattiedot.data?.oid === oid) {
            router.replace('/omattiedot');
        }
    }, [omattiedot]);

    const view = location.pathname.split('/')[1];
    if (!omattiedot.data || omattiedot.omattiedotLoading) {
        return <Loader />;
    } else if (omattiedot.isAdmin) {
        return <AdminViewContainer router={router} oidHenkilo={oid} henkiloType={henkiloType} />;
    } else if (view === 'virkailija') {
        return <VirkailijaViewContainer oidHenkilo={oid} />;
    } else if (view === 'oppija') {
        return <OppijaViewContainer oidHenkilo={oid} />;
    }

    return (
        <LocalNotification type={NOTIFICATIONTYPES.WARNING} title={l10n[locale]['HENKILO_SIVU_VIRHE']} toggle={true} />
    );
};

export default HenkiloViewContainer;
