import React, { useRef } from 'react';
import { useParams } from 'react-router';

import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { virkailija2Navi } from '../navigation/navigationconfigurations';
import { useGetKayttajatiedotQuery, useGetKayttooikeusAnomuksetForHenkiloQuery } from '../../api/kayttooikeus';
import { useLocalisations, useRedirectByUser } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import { VirkailijaPerustiedot } from './VirkailijaPerustiedot';
import Mfa from '../henkilo/Mfa';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import HenkiloViewOpenKayttooikeusanomus from '../common/henkilo/HenkiloViewOpenKayttooikeusanomus';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { OphDsCard } from '../design-system/OphDsCard';
import { GenericErrorPage } from '../GenericErrorPage';
import Loader from '../common/icons/Loader';

export const VirkailijaPage = () => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    useRedirectByUser(oid, 'VIRKAILIJA');
    const { L } = useLocalisations();
    useTitle(L['TITLE_VIRKAILIJA']);
    useNavigation(virkailija2Navi(oid), true);
    const { isLoading, error } = useGetKayttajatiedotQuery(oid);
    const { data: anomukset } = useGetKayttooikeusAnomuksetForHenkiloQuery(oid);
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        if ('status' in error) {
            if (error.status === 401 || error.status === 403) {
                return <VirheKayttoEstetty L={L} />;
            }
        }
        return <GenericErrorPage link="/virkailijahaku" />;
    }

    return (
        <OphDsPage header={L['TITLE_VIRKAILIJA']!}>
            <OphDsCard>
                <VirkailijaPerustiedot oid={oid} />
            </OphDsCard>
            <OphDsCard>
                <Mfa henkiloOid={oid} view="virkailija" />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewOrganisationContent henkiloOid={oid} />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewExistingKayttooikeus
                    existingKayttooikeusRef={existingKayttooikeusRef}
                    oidHenkilo={oid}
                    isOmattiedot={false}
                />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewOpenKayttooikeusanomus anomukset={anomukset ?? []} isOmattiedot={false} />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewExpiredKayttooikeus oidHenkilo={oid} isOmattiedot={false} />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewCreateKayttooikeus oidHenkilo={oid} existingKayttooikeusRef={existingKayttooikeusRef} />
            </OphDsCard>
        </OphDsPage>
    );
};
