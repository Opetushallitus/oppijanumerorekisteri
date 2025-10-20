import React, { useEffect, useId } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useLocalisations } from '../../selectors';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
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
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import { isOnrRekisterinpitaja } from '../../utilities/palvelurooli.util';
import Loader from '../common/icons/Loader';

export const OppijaViewPage = () => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    const { data: omattiedot, isLoading } = useGetOmattiedotQuery();
    const isRekisterinpitaja = omattiedot ? isOnrRekisterinpitaja(omattiedot.organisaatiot) : false;
    const { L } = useLocalisations();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(oid);
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const navigate = useNavigate();
    const yksilointitiedotQuery = useGetYksilointitiedotQuery(oid);

    useTitle(L['TITLE_OPPIJA']);
    useNavigation(
        henkiloViewTabs(oid, isHenkiloLoading, henkilo, 'oppija', master?.oidHenkilo, yksilointitiedotQuery.data),
        true
    );

    useEffect(() => {
        if (oid && omattiedot?.oidHenkilo === oid) {
            navigate('/omattiedot', { replace: true });
        }
    }, [omattiedot, oid]);

    const henkilotunnisteetSectionLabel = useId();
    if (isHenkiloLoading || isLoading) {
        return <Loader />;
    } else if (henkilo?.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={L} />;
    } else {
        return (
            <div className="mainContent">
                <div className="wrapper">
                    <UserContentContainer
                        oidHenkilo={oid}
                        view={omattiedot?.isAdmin ? 'admin' : 'oppija'}
                        isOppija={true}
                    />
                </div>
                {isRekisterinpitaja && (
                    <section aria-labelledby={henkilotunnisteetSectionLabel} className="wrapper">
                        <h2 id={henkilotunnisteetSectionLabel}>{L.TUNNISTEET_OTSIKKO}</h2>
                        <Identifications oid={oid} />
                    </section>
                )}
                <div className="wrapper">
                    <HenkiloViewContactContent
                        henkiloOid={oid}
                        view={omattiedot?.isAdmin ? 'admin' : 'oppija'}
                        readOnly={true}
                    />
                </div>
            </div>
        );
    }
};
