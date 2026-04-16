import React, { useRef } from 'react';
import { useParams } from 'react-router';

import { useLocalisations, useRedirectByUser } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { jarjestelmatunnusNavigation } from '../navigation/navigationconfigurations';
import { JarjestelmatunnusPerustiedot } from './JarjestelmatunnusPerustiedot';
import { SulkeutuneetKayttooikeudet } from '../virkailija/SulkeutuneetKayttooikeudet';
import { VoimassaolevatKayttooikeudet } from '../virkailija/VoimassaolevatKayttooikeudet';
import { OphDsCard } from '../design-system/OphDsCard';

import './JarjestelmatunnusEditPage.css';

export const JarjestelmatunnusEditPage = () => {
    const params = useParams();
    if (!params.oid) {
        return;
    }

    useRedirectByUser(params.oid, 'PALVELU');
    const { L } = useLocalisations();
    useTitle(L('JARJESTELMATUNNUKSEN_HALLINTA'));
    useNavigation(jarjestelmatunnusNavigation);
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);

    return (
        <OphDsPage header={L('JARJESTELMATUNNUKSEN_HALLINTA')}>
            <OphDsCard>
                <JarjestelmatunnusPerustiedot />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewOrganisationContent henkiloOid={params.oid} />
            </OphDsCard>
            <OphDsCard>
                <VoimassaolevatKayttooikeudet
                    existingKayttooikeusRef={existingKayttooikeusRef}
                    isPalvelukayttaja
                    oidHenkilo={params.oid}
                />
            </OphDsCard>
            <OphDsCard>
                <SulkeutuneetKayttooikeudet oidHenkilo={params.oid} />
            </OphDsCard>
            <OphDsCard>
                <HenkiloViewCreateKayttooikeus
                    oidHenkilo={params.oid}
                    existingKayttooikeusRef={existingKayttooikeusRef}
                    isPalvelukayttaja
                />
            </OphDsCard>
        </OphDsPage>
    );
};
