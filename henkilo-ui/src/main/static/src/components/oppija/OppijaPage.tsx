import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';

import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { oppijaNavigation } from '../navigation/navigationconfigurations';
import { useLocalisations } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsCard } from '../design-system/OphDsCard';
import { Identifications } from '../henkilo/Identifications';
import { OppijaPerustiedot } from './OppijaPerustiedot';
import HenkiloViewContactContent from '../common/henkilo/HenkiloViewContactContent';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import Loader from '../common/icons/Loader';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { useGetHenkiloQuery } from '../../api/oppijanumerorekisteri';
import { isOnrRekisterinpitaja } from '../../utilities/palvelurooli.util';
import { OppijaTabs } from './OppijaTabs';

export const OppijaPage = () => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    const navigate = useNavigate();
    const { L } = useLocalisations();
    useTitle(L['TITLE_OPPIJA']);
    useNavigation(oppijaNavigation, false);
    const { data: omattiedot, isLoading } = useGetOmattiedotQuery();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(oid);

    useEffect(() => {
        if (oid && omattiedot?.oidHenkilo === oid) {
            navigate('/omattiedot', { replace: true });
        }
    }, [omattiedot, oid]);

    if (isHenkiloLoading || isLoading) {
        return <Loader />;
    } else if (henkilo?.henkiloKayttoEstetty) {
        return <VirheKayttoEstetty L={L} />;
    } else {
        return (
            <OphDsPage
                header={henkilo ? `${henkilo?.sukunimi}, ${henkilo?.etunimet}` : '...'}
                tabs={<OppijaTabs oid={oid} />}
            >
                <OphDsCard>
                    <OppijaPerustiedot oid={oid} />
                </OphDsCard>
                {isOnrRekisterinpitaja(omattiedot?.organisaatiot) && (
                    <OphDsCard>
                        <Identifications oid={oid} />
                    </OphDsCard>
                )}
                <OphDsCard>
                    <HenkiloViewContactContent henkiloOid={oid} />
                </OphDsCard>
            </OphDsPage>
        );
    }
};
