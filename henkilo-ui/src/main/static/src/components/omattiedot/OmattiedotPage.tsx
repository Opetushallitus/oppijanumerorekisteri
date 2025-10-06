import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch, type RootState } from '../../store';
import { fetchHenkilo, clearHenkilo } from '../../actions/henkilo.actions';
import { HenkiloState, isHenkiloStateLoading } from '../../reducers/henkilo.reducer';
import Loader from '../common/icons/Loader';
import { useGetKayttooikeusAnomuksetForHenkiloQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { UserContentContainer } from '../common/henkilo/usercontent/UserContentContainer';
import Mfa from '../henkilo/Mfa';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { HenkiloViewCreateKayttooikeusanomus } from '../common/henkilo/HenkiloViewCreateKayttooikeusanomus';

export const OmattiedotPage = () => {
    const { data: omattiedot, isLoading } = useGetOmattiedotQuery();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const dispatch = useAppDispatch();
    const { L } = useLocalisations();
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);
    const { data: anomukset, isLoading: isAnomuksetLoading } = useGetKayttooikeusAnomuksetForHenkiloQuery(
        omattiedot.oidHenkilo,
        { skip: !omattiedot.oidHenkilo }
    );

    useTitle(L['TITLE_OMAT_TIEDOT']);

    useEffect(() => {
        if (omattiedot?.oidHenkilo) {
            const userOid = omattiedot.oidHenkilo;
            dispatch(clearHenkilo());
            dispatch<any>(fetchHenkilo(userOid));
        }
    }, [omattiedot]);

    if (isLoading || isHenkiloStateLoading(henkilo) || isAnomuksetLoading) {
        return <Loader />;
    } else {
        return (
            <div className="mainContent">
                <div className="wrapper">
                    <UserContentContainer oidHenkilo={omattiedot.oidHenkilo} view="omattiedot" />
                </div>
                <div className="wrapper">
                    <h2>{L.TIETOTURVA_ASETUKSET_OTSIKKO}</h2>
                    <Mfa henkiloOid={omattiedot.oidHenkilo} view="omattiedot" />
                </div>
                <div className="wrapper">
                    <HenkiloViewContactContent view="omattiedot" readOnly={true} />
                </div>
                <div className="wrapper" ref={existingKayttooikeusRef}>
                    <HenkiloViewExistingKayttooikeus
                        isPalvelukayttaja={false}
                        oidHenkilo={omattiedot.oidHenkilo}
                        isOmattiedot={true}
                        existingKayttooikeusRef={existingKayttooikeusRef}
                    />
                </div>
                <div className="wrapper">
                    <HenkiloViewOpenKayttooikeusanomus anomukset={anomukset ?? []} isOmattiedot={true} />
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
