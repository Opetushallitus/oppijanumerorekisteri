import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../store';
import Loader from '../common/icons/Loader';
import {
    clearHenkilo,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKayttaja,
    fetchKayttajatieto,
} from '../../actions/henkilo.actions';
import { fetchAllKayttooikeusAnomusForHenkilo } from '../../actions/kayttooikeusryhma.actions';
import { HenkiloState, isHenkiloStateLoading } from '../../reducers/henkilo.reducer';
import { useLocalisations } from '../../selectors';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { henkiloViewTabs } from '../navigation/NavigationTabs';
import { useGetHenkiloMasterQuery, useGetYksilointitiedotQuery } from '../../api/oppijanumerorekisteri';
import { isKayttooikeusryhmaStateLoading, KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';
import { UserContentContainer } from '../common/henkilo/usercontent/UserContentContainer';
import { Identifications } from './Identifications';
import Mfa from './Mfa';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import StaticUtils from '../common/StaticUtils';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import { isOnrRekisterinpitaja } from '../../utilities/palvelurooli.util';
import { View } from '../../types/constants';

const titles = {
    virkailija: 'TITLE_VIRKAILIJA',
    admin: 'TITLE_ADMIN',
};

export const VirkailijaViewPage = () => {
    const { data: omattiedot } = useGetOmattiedotQuery();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const [view, setView] = useState<View>('virkailija');
    const { L } = useLocalisations();
    const { oid } = useParams();
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isRekisterinpitaja = omattiedot ? isOnrRekisterinpitaja(omattiedot.organisaatiot) : false;
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(oid);

    useTitle(L[titles[view]]);
    useNavigation(henkiloViewTabs(oid, henkilo, 'virkailija', master?.oidHenkilo, yksilointitiedotQuery.data), true);

    useEffect(() => {
        if (oid && omattiedot.oidHenkilo === oid) {
            navigate('/omattiedot', { replace: true });
        }
        if (omattiedot.isAdmin) {
            setView('admin');
        }

        dispatch(clearHenkilo());
        dispatch<any>(fetchHenkilo(oid));
        dispatch<any>(fetchHenkiloOrgs(oid));
        dispatch<any>(fetchKayttaja(oid));
        dispatch<any>(fetchKayttajatieto(oid));
        dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(oid));
    }, [omattiedot, oid]);

    if (isHenkiloStateLoading(henkilo) || isKayttooikeusryhmaStateLoading(kayttooikeus)) {
        return <Loader />;
    } else if (henkilo.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={L} />;
    } else {
        return (
            <div className="mainContent">
                <div className="wrapper">
                    <UserContentContainer oidHenkilo={oid} view={view} />
                </div>
                {isRekisterinpitaja && (
                    <div className="wrapper">
                        <h2>{L.TUNNISTEET_OTSIKKO}</h2>
                        <Identifications oid={oid} />
                    </div>
                )}
                <div className="wrapper">
                    <h2>{L.TIETOTURVA_ASETUKSET_OTSIKKO}</h2>
                    <Mfa view={view} />
                </div>
                <div className="wrapper">
                    <HenkiloViewContactContent view={view} readOnly={true} />
                </div>
                <div className="wrapper">
                    {henkilo.henkiloOrgsLoading ? <Loader /> : <HenkiloViewOrganisationContent />}
                </div>
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    <HenkiloViewExistingKayttooikeus
                        vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                        oidHenkilo={oid}
                        isOmattiedot={false}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                    />
                </div>
                <div className="wrapper">
                    {kayttooikeus.kayttooikeusAnomusLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewOpenKayttooikeusanomus kayttooikeus={kayttooikeus} isOmattiedot={false} />
                    )}
                </div>
                <div className="wrapper">
                    <HenkiloViewExpiredKayttooikeus oidHenkilo={henkilo.henkilo.oidHenkilo} isOmattiedot={false} />
                </div>
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeus
                        oidHenkilo={oid}
                        vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                        isPalvelukayttaja={henkilo.kayttaja.kayttajaTyyppi === 'PALVELU'}
                    />
                </div>
            </div>
        );
    }
};
