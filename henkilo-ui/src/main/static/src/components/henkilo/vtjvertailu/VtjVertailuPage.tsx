import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../../store';
import {
    fetchHenkilo,
    fetchHenkiloYksilointitieto,
    fetchHenkiloSlaves,
    fetchHenkiloMaster,
    overrideYksiloimatonHenkiloVtjData,
} from '../../../actions/henkilo.actions';
import VtjVertailuListaus from './VtjVertailuListaus';
import Loader from '../../common/icons/Loader';
import Button from '../../common/button/Button';
import { enabledVtjVertailuView, henkiloViewTabs } from '../../navigation/NavigationTabs';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { NOTIFICATIONTYPES } from '../../common/Notification/notificationtypes';
import { addGlobalNotification } from '../../../actions/notification.actions';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { useNavigation } from '../../../useNavigation';

type OwnProps = {
    henkiloType: string;
};

export const VtjVertailuPage = (props: OwnProps) => {
    const params = useParams();
    const oidHenkilo = params.oid;
    const dispatch = useAppDispatch();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { L } = useLocalisations();
    useTitle(L['TITLE_VTJ_VERTAILU']);
    useNavigation(henkiloViewTabs(oidHenkilo, henkilo, props.henkiloType), true);

    useEffect(() => {
        dispatch<any>(fetchHenkilo(oidHenkilo));
        dispatch<any>(fetchHenkiloYksilointitieto(oidHenkilo));
        dispatch<any>(fetchHenkiloMaster(oidHenkilo));
        dispatch<any>(fetchHenkiloSlaves(oidHenkilo)); // tabs need data about master to switch duplicates tab enabled
    }, []);

    async function overrideHenkiloInformation(): Promise<void> {
        try {
            await overrideYksiloimatonHenkiloVtjData(oidHenkilo);
            await fetchHenkilo(oidHenkilo);
            dispatch(
                addGlobalNotification({
                    key: 'HENKILOVTJYLIAJOISUCCESS',
                    title: L['HENKILO_VTJ_YLIAJA_SUCCESS'],
                    type: NOTIFICATIONTYPES.SUCCESS,
                    autoClose: 10000,
                })
            );
        } catch (error) {
            dispatch(
                addGlobalNotification({
                    key: 'HENKILOVTJYLIAJOIFAILURE',
                    title: L['HENKILO_VTJ_YLIAJA_FAILURE'],
                    type: NOTIFICATIONTYPES.ERROR,
                    autoClose: 10000,
                })
            );
            throw error;
        }
    }

    function isDisabled(): boolean {
        const hasAccess = hasAnyPalveluRooli(omattiedot?.organisaatiot, [
            'HENKILONHALLINTA_OPHREKISTERI',
            'OPPIJANUMEROREKISTERI_REKISTERINPITAJA',
            'OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA',
            'OPPIJANUMEROREKISTERI_OPPIJOIDENTUONTI',
        ]);
        const currentUserIsViewedHenkilo = oidHenkilo === omattiedot?.oidHenkilo;
        const isEnabledVtjVertailuView = enabledVtjVertailuView(henkilo.henkilo);
        return !isEnabledVtjVertailuView || currentUserIsViewedHenkilo || !hasAccess;
    }

    return henkilo.yksilointitiedotLoading || henkilo.henkiloLoading ? (
        <Loader />
    ) : (
        <div className="mainContent wrapper">
            <h2>{L['HENKILO_VTJ_VERTAILU']}</h2>
            <VtjVertailuListaus henkilo={henkilo} />
            <Button action={overrideHenkiloInformation} disabled={isDisabled()}>
                {L['HENKILO_VTJ_YLIAJA']}
            </Button>
        </div>
    );
};
