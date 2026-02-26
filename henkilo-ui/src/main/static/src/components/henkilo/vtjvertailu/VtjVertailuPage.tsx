import React from 'react';
import { useParams } from 'react-router';

import { useAppDispatch } from '../../../store';
import VtjVertailuListaus from './VtjVertailuListaus';
import Loader from '../../common/icons/Loader';
import Button from '../../common/button/Button';
import { enabledVtjVertailuView, henkiloViewTabs } from '../../navigation/NavigationTabs';
import { hasAnyPalveluRooli } from '../../../utilities/palvelurooli.util';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useGetOmattiedotQuery } from '../../../api/kayttooikeus';
import { useNavigation } from '../../../useNavigation';
import {
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
    useGetYksilointitiedotQuery,
    usePutYliajaYksiloimatonMutation,
} from '../../../api/oppijanumerorekisteri';
import { add } from '../../../slices/toastSlice';

type OwnProps = {
    henkiloType: 'virkailija' | 'oppija';
};

export const VtjVertailuPage = (props: OwnProps) => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    const dispatch = useAppDispatch();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(oid);
    const { data: omattiedot } = useGetOmattiedotQuery();
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const { L } = useLocalisations();
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(oid);
    const [yliajaYksiloimaton] = usePutYliajaYksiloimatonMutation();

    useTitle(L('TITLE_VTJ_VERTAILU'));
    useNavigation(
        henkiloViewTabs(oid, henkilo, props.henkiloType, master?.oidHenkilo, yksilointitiedotQuery.data),
        true
    );

    async function overrideHenkiloInformation(oid: string): Promise<void> {
        await yliajaYksiloimaton(oid)
            .unwrap()
            .then(() => {
                dispatch(
                    add({
                        id: `HENKILOVTJYLIAJOISUCCESS-${Math.random()}`,
                        header: L('HENKILO_VTJ_YLIAJA_SUCCESS'),
                        type: 'ok',
                    })
                );
            })
            .catch(() => {
                dispatch(
                    add({
                        id: `HENKILOVTJYLIAJOIFAILURE-${Math.random()}`,
                        header: L('HENKILO_VTJ_YLIAJA_FAILURE'),
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
        const currentUserIsViewedHenkilo = oid === omattiedot?.oidHenkilo;
        const isEnabledVtjVertailuView = enabledVtjVertailuView(henkilo);
        return !isEnabledVtjVertailuView || currentUserIsViewedHenkilo || !hasAccess;
    }

    return yksilointitiedotQuery.isLoading || isHenkiloLoading || !henkilo ? (
        <Loader />
    ) : (
        <div className="mainContent wrapper">
            <h2>{L('HENKILO_VTJ_VERTAILU')}</h2>
            <VtjVertailuListaus henkilo={henkilo} />
            <Button action={() => overrideHenkiloInformation(oid)} disabled={isDisabled()}>
                {L('HENKILO_VTJ_YLIAJA')}
            </Button>
        </div>
    );
};
