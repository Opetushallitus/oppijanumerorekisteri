import React, { useRef } from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { jarjestelmatunnusNavigation } from '../navigation/navigationconfigurations';
import { JarjestelmatunnusPerustiedot } from './JarjestelmatunnusPerustiedot';

import './JarjestelmatunnusEditPage.css';

export const JarjestelmatunnusEditPage = () => {
    const params = useParams();
    if (!params.oid) {
        return;
    }

    const { L } = useLocalisations();
    useTitle(L['JARJESTELMATUNNUKSEN_HALLINTA']);
    useNavigation(jarjestelmatunnusNavigation(params.oid), false);
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);

    return (
        <OphDsPage header={L['JARJESTELMATUNNUKSEN_HALLINTA']!}>
            <JarjestelmatunnusPerustiedot />
            <hr />
            <HenkiloViewOrganisationContent henkiloOid={params.oid} />
            <hr />
            <HenkiloViewExistingKayttooikeus
                existingKayttooikeusRef={existingKayttooikeusRef}
                isPalvelukayttaja={true}
                oidHenkilo={params.oid}
                isOmattiedot={false}
            />
            <hr />
            <HenkiloViewExpiredKayttooikeus oidHenkilo={params.oid} isOmattiedot={false} />
            <hr />
            <HenkiloViewCreateKayttooikeus
                oidHenkilo={params.oid}
                existingKayttooikeusRef={existingKayttooikeusRef}
                isPalvelukayttaja={true}
            />
        </OphDsPage>
    );
};
