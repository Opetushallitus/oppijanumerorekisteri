import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../../store';
import { fetchHenkilo } from '../../../actions/henkilo.actions';
import VtjVertailuListaus from './VtjVertailuListaus';
import Loader from '../../common/icons/Loader';
import Button from '../../common/button/Button';
import { enabledVtjVertailuView, henkiloViewTabs } from '../../navigation/NavigationTabs';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { useNavigation } from '../../../useNavigation';
import {
    useGetHenkiloMasterQuery,
    useGetYksilointitiedotQuery,
    usePutYliajaYksiloimatonMutation,
} from '../../../api/oppijanumerorekisteri';
import { add } from '../../../slices/toastSlice';

type OwnProps = {
    henkiloType: string;
};

export const VtjVertailuPage = (props: OwnProps) => {
    const params = useParams();
    const oidHenkilo = params.oid;
    const dispatch = useAppDispatch();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: master } = useGetHenkiloMasterQuery(params.oid);
    const { L } = useLocalisations();
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(henkilo.henkilo.oidHenkilo);
    const [yliajaYksiloimaton] = usePutYliajaYksiloimatonMutation();

    useTitle(L['TITLE_VTJ_VERTAILU']);
    useNavigation(
        henkiloViewTabs(oidHenkilo, henkilo, props.henkiloType, master?.oidHenkilo, yksilointitiedotQuery.data),
        true
    );

    useEffect(() => {
        dispatch<any>(fetchHenkilo(oidHenkilo));
    }, []);

    async function overrideHenkiloInformation(): Promise<void> {
        await yliajaYksiloimaton(oidHenkilo)
            .unwrap()
            .then(() => {
                fetchHenkilo(oidHenkilo)(dispatch);
                dispatch(
                    add({
                        id: `HENKILOVTJYLIAJOISUCCESS-${Math.random()}`,
                        header: L['HENKILO_VTJ_YLIAJA_SUCCESS'],
                        type: 'ok',
                    })
                );
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `HENKILOVTJYLIAJOIFAILURE-${Math.random()}`,
                        header: L['HENKILO_VTJ_YLIAJA_FAILURE'],
                        type: 'error',
                    })
                );
            });
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

    return yksilointitiedotQuery.isLoading || henkilo.henkiloLoading ? (
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
