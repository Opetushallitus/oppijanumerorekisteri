import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch, type RootState } from '../../store';
import { fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, clearHenkilo } from '../../actions/henkilo.actions';
import { fetchAllKayttooikeusAnomusForHenkilo } from '../../actions/kayttooikeusryhma.actions';
import { HenkiloState, isHenkiloStateLoading } from '../../reducers/henkilo.reducer';
import Loader from '../common/icons/Loader';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { UserContentContainer } from '../common/henkilo/usercontent/UserContentContainer';
import Mfa from '../henkilo/Mfa';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import StaticUtils from '../common/StaticUtils';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { HenkiloViewCreateKayttooikeusanomus } from '../common/henkilo/HenkiloViewCreateKayttooikeusanomus';
import { isKayttooikeusryhmaStateLoading, KayttooikeusRyhmaState } from '../../reducers/kayttooikeusryhma.reducer';

export const OmattiedotPage = () => {
    const { data: omattiedot, isLoading } = useGetOmattiedotQuery();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const kayttooikeus = useSelector<RootState, KayttooikeusRyhmaState>((state) => state.kayttooikeus);
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);

    useTitle(L['TITLE_OMAT_TIEDOT']);

    useEffect(() => {
        if (omattiedot.oidHenkilo) {
            const userOid = omattiedot.oidHenkilo;
            dispatch(clearHenkilo());
            dispatch<any>(fetchHenkilo(userOid));
            dispatch<any>(fetchKayttajatieto(userOid));
            dispatch<any>(fetchHenkiloOrgs(userOid));
            dispatch<any>(fetchAllKayttooikeusAnomusForHenkilo(userOid));
        }
    }, []);

    if (isLoading || isHenkiloStateLoading(henkilo) || isKayttooikeusryhmaStateLoading(kayttooikeus)) {
        return <Loader />;
    } else {
        return (
            <div className="mainContent">
                <div className="wrapper">
                    <UserContentContainer oidHenkilo={omattiedot.oidHenkilo} view="omattiedot" />
                </div>
                <div className="wrapper">
                    <h2>{L.TIETOTURVA_ASETUKSET_OTSIKKO}</h2>
                    <Mfa view="omattiedot" />
                </div>
                <div className="wrapper">
                    <HenkiloViewContactContent view="omattiedot" readOnly={true} />
                </div>
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    <HenkiloViewExistingKayttooikeus
                        vuosia={StaticUtils.getKayttooikeusKestoVuosissa(henkilo.kayttaja)}
                        oidHenkilo={omattiedot.oidHenkilo}
                        isOmattiedot={true}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                    />
                </div>
                <div className="wrapper">
                    {kayttooikeus.kayttooikeusAnomusLoading ? (
                        <Loader />
                    ) : (
                        <HenkiloViewOpenKayttooikeusanomus kayttooikeus={kayttooikeus} isOmattiedot={true} />
                    )}
                </div>
                <div className="wrapper">
                    <HenkiloViewExpiredKayttooikeus oidHenkilo={henkilo.henkilo.oidHenkilo} isOmattiedot={true} />
                </div>
                <div className="wrapper">
                    <HenkiloViewCreateKayttooikeusanomus />
                </div>
            </div>
        );
    }
};
