import React, { useRef } from 'react';
import { useParams } from 'react-router';

import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { virkailijaNavigation } from '../navigation/navigationconfigurations';
import { useGetKayttajatiedotQuery } from '../../api/kayttooikeus';
import { useLocalisations, useRedirectByUser } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import { VirkailijaPerustiedot } from './VirkailijaPerustiedot';
import { VirkailijaMfa } from './VirkailijaMfa';
import { AvoimetKayttooikeusanomukset } from './AvoimetKayttooikeusanomukset';
import { SulkeutuneetKayttooikeudet } from './SulkeutuneetKayttooikeudet';
import { VoimassaolevatKayttooikeudet } from './VoimassaolevatKayttooikeudet';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import VirheKayttoEstetty from '../virhe/VirheKayttoEstetty';
import { OphDsCard } from '../design-system/OphDsCard';
import { GenericErrorPage } from '../GenericErrorPage';
import { OphDsSpinner } from '../design-system/OphDsSpinner';

export const VirkailijaPage = () => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    useRedirectByUser(oid, 'VIRKAILIJA');
    const { L } = useLocalisations();
    useTitle(L('TITLE_VIRKAILIJA'));
    useNavigation(virkailijaNavigation, false);
    const { isLoading, error } = useGetKayttajatiedotQuery(oid);
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);

    if (isLoading) {
        return <OphDsSpinner />;
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
        <OphDsPage header={L('TITLE_VIRKAILIJA')}>
            <VirkailijaPerustiedot oid={oid} />
            <OphDsCard>
                <VirkailijaMfa henkiloOid={oid} />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewOrganisationContent henkiloOid={oid} />
            </OphDsCard>
            <OphDsCard>
                <VoimassaolevatKayttooikeudet existingKayttooikeusRef={existingKayttooikeusRef} oidHenkilo={oid} />
            </OphDsCard>
            <OphDsCard>
                <AvoimetKayttooikeusanomukset oidHenkilo={oid} />
            </OphDsCard>
            <OphDsCard>
                <SulkeutuneetKayttooikeudet oidHenkilo={oid} />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewCreateKayttooikeus oidHenkilo={oid} existingKayttooikeusRef={existingKayttooikeusRef} />
            </OphDsCard>
        </OphDsPage>
    );
};
