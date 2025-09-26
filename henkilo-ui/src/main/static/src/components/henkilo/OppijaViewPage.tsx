import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router';

import { useAppDispatch, type RootState } from '../../store';
import { clearHenkilo, fetchHenkilo } from '../../actions/henkilo.actions';
import { HenkiloState } from '../../reducers/henkilo.reducer';
import { useLocalisations } from '../../selectors';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { henkiloViewTabs } from '../navigation/NavigationTabs';
import { useGetHenkiloMasterQuery, useGetYksilointitiedotQuery } from '../../api/oppijanumerorekisteri';
import { UserContentContainer } from '../common/henkilo/usercontent/UserContentContainer';
import { Identifications } from './Identifications';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import { isOnrRekisterinpitaja } from '../../utilities/palvelurooli.util';
import Loader from '../common/icons/Loader';

export const OppijaViewPage = () => {
    const { data: omattiedot, isLoading } = useGetOmattiedotQuery();
    const isRekisterinpitaja = omattiedot ? isOnrRekisterinpitaja(omattiedot.organisaatiot) : false;
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { L } = useLocalisations();
    const { oid } = useParams();
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(oid);

    useTitle(L['TITLE_OPPIJA']);
    useNavigation(henkiloViewTabs(oid, henkilo, 'oppija', master?.oidHenkilo, yksilointitiedotQuery.data), true);

    useEffect(() => {
        if (oid && omattiedot.oidHenkilo === oid) {
            navigate('/omattiedot', { replace: true });
        }

        dispatch(clearHenkilo());
        dispatch<any>(fetchHenkilo(oid));
    }, [omattiedot, oid]);

    if (henkilo.henkiloLoading || isLoading) {
        return <Loader />;
    } else if (henkilo.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={L} />;
    } else {
        return (
            <div className="mainContent">
                <div className="wrapper">
                    <UserContentContainer oidHenkilo={oid} view={omattiedot.isAdmin ? 'admin' : 'oppija'} />
                </div>
                {isRekisterinpitaja && (
                    <div className="wrapper">
                        <h2>{L.TUNNISTEET_OTSIKKO}</h2>
                        <Identifications oid={henkilo.henkilo.oidHenkilo} />
                    </div>
                )}
                <div className="wrapper">
                    <HenkiloViewContactContent view={omattiedot.isAdmin ? 'admin' : 'oppija'} readOnly={true} />
                </div>
            </div>
        );
    }
};
