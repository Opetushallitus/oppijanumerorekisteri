import React, { useEffect, useId, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../store';
import Loader from '../common/icons/Loader';
import { clearHenkilo, fetchHenkilo } from '../../actions/henkilo.actions';
import { HenkiloState, isHenkiloStateLoading } from '../../reducers/henkilo.reducer';
import { useLocalisations } from '../../selectors';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import {
    useGetKayttajatiedotQuery,
    useGetKayttooikeusAnomuksetForHenkiloQuery,
    useGetOmattiedotQuery,
} from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { henkiloViewTabs } from '../navigation/NavigationTabs';
import { useGetHenkiloMasterQuery, useGetYksilointitiedotQuery } from '../../api/oppijanumerorekisteri';
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

const titles = {
    virkailija: 'TITLE_VIRKAILIJA',
    admin: 'TITLE_ADMIN',
};

export const VirkailijaViewPage = () => {
    const { data: omattiedot } = useGetOmattiedotQuery();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const [view, setView] = useState<View>('virkailija');
    const { L } = useLocalisations();
    const { oid } = useParams();
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const { data: kayttajatiedot } = useGetKayttajatiedotQuery(oid);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isRekisterinpitaja = omattiedot ? isOnrRekisterinpitaja(omattiedot.organisaatiot) : false;
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(oid);
    const { data: anomukset, isLoading: isAnomuksetLoading } = useGetKayttooikeusAnomuksetForHenkiloQuery(oid);

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
    }, [omattiedot, oid]);

    const henkilotunnisteetSectionLabel = useId();
    const mfaSectionLabelId = useId();

    if (isHenkiloStateLoading(henkilo) || isAnomuksetLoading) {
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
                    <section aria-labelledby={henkilotunnisteetSectionLabel} className="wrapper">
                        <h2 id={henkilotunnisteetSectionLabel}>{L.TUNNISTEET_OTSIKKO}</h2>
                        <Identifications oid={oid} />
                    </section>
                )}
                <section aria-labelledby={mfaSectionLabelId} className="wrapper">
                    <h2 id={mfaSectionLabelId}>{L.TIETOTURVA_ASETUKSET_OTSIKKO}</h2>
                    <Mfa henkiloOid={oid} view={view} />
                </section>
                <div className="wrapper">
                    <HenkiloViewContactContent view={view} readOnly={true} />
                </div>
                <div className="wrapper">
                    <HenkiloViewOrganisationContent />
                </div>
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    <HenkiloViewExistingKayttooikeus
                        isPalvelukayttaja={kayttajatiedot?.kayttajaTyyppi === 'PALVELU'}
                        oidHenkilo={oid}
                        isOmattiedot={false}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                    />
                </div>
                <div className="wrapper">
                    <HenkiloViewOpenKayttooikeusanomus anomukset={anomukset ?? []} isOmattiedot={false} />
                </div>
                <div className="wrapper">
                    <HenkiloViewExpiredKayttooikeus oidHenkilo={henkilo.henkilo.oidHenkilo} isOmattiedot={false} />
                </div>
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeus
                        oidHenkilo={oid}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                        isPalvelukayttaja={kayttajatiedot?.kayttajaTyyppi === 'PALVELU'}
                    />
                </div>
            </div>
        );
    }
};
