import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

import Loader from '../common/icons/Loader';
import { useLocalisations } from '../../selectors';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { useGetKayttooikeusAnomuksetForHenkiloQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { henkiloViewTabs } from '../navigation/NavigationTabs';
import {
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
    useGetYksilointitiedotQuery,
} from '../../api/oppijanumerorekisteri';
import { UserContentContainer } from '../common/henkilo/usercontent/UserContentContainer';
import { Identifications } from './Identifications';
import Mfa from './Mfa';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import { isOnrRekisterinpitaja } from '../../utilities/palvelurooli.util';
import { View } from '../../types/constants';

const titles: Record<View, string> = {
    virkailija: 'TITLE_VIRKAILIJA',
    admin: 'TITLE_ADMIN',
    omattiedot: 'TITLE_VIRKAILIJA',
    oppija: 'TITLE_OPPIJA',
};

export const VirkailijaViewPage = () => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    const { data: omattiedot } = useGetOmattiedotQuery();
    const [view, setView] = useState<View>('virkailija');
    const { L } = useLocalisations();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(oid);
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const navigate = useNavigate();
    const isRekisterinpitaja = omattiedot ? isOnrRekisterinpitaja(omattiedot.organisaatiot) : false;
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(oid);
    const { data: anomukset, isLoading: isAnomuksetLoading } = useGetKayttooikeusAnomuksetForHenkiloQuery(oid);

    useTitle(L(titles[view]));
    useNavigation(henkiloViewTabs(oid, henkilo, 'virkailija', master?.oidHenkilo, yksilointitiedotQuery.data), true);

    useEffect(() => {
        if (oid && omattiedot?.oidHenkilo === oid) {
            navigate('/omattiedot', { replace: true });
        }
        if (omattiedot?.isAdmin) {
            setView('admin');
        }
    }, [omattiedot, oid]);

    if (isHenkiloLoading || isAnomuksetLoading) {
        return <Loader />;
    } else if (henkilo?.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={L} />;
    } else {
        return (
            <div className="mainContent">
                <div className="wrapper">
                    <UserContentContainer oidHenkilo={oid} view={view} />
                </div>
                {isRekisterinpitaja && (
                    <div className="wrapper">
                        <Identifications oid={oid} />
                    </div>
                )}
                <div className="wrapper">
                    <Mfa henkiloOid={oid} view={view} />
                </div>
                <div className="wrapper">
                    <HenkiloViewContactContent henkiloOid={oid} />
                </div>
                <div className="wrapper">
                    <HenkiloViewOrganisationContent henkiloOid={oid} />
                </div>
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    <HenkiloViewExistingKayttooikeus
                        oidHenkilo={oid}
                        isOmattiedot={false}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                    />
                </div>
                <div className="wrapper">
                    <HenkiloViewOpenKayttooikeusanomus anomukset={anomukset ?? []} isOmattiedot={false} />
                </div>
                <div className="wrapper">
                    <HenkiloViewExpiredKayttooikeus oidHenkilo={oid} isOmattiedot={false} />
                </div>
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeus oidHenkilo={oid} existingKayttooikeusRef={existingKayttooikeusRef} />
                </div>
            </div>
        );
    }
};
