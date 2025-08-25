import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import HenkiloViewCreateKayttooikeus from '../common/henkilo/HenkiloViewCreateKayttooikeus';
import HenkiloViewExistingKayttooikeus from '../common/henkilo/HenkiloViewExistingKayttooikeus';
import { HenkiloViewOrganisationContent } from '../common/henkilo/HenkiloViewOrganisationContent';
import { useAppDispatch } from '../../store';
import { clearHenkilo, fetchHenkilo, fetchHenkiloOrgs } from '../../actions/henkilo.actions';
import HenkiloViewExpiredKayttooikeus from '../common/henkilo/HenkiloViewExpiredKayttooikeus';
import { fetchAllKayttooikeusryhmasForHenkilo } from '../../actions/kayttooikeusryhma.actions';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { jarjestelmatunnusNavigation } from '../navigation/navigationconfigurations';
import { JarjestelmatunnusPerustiedot } from './JarjestelmatunnusPerustiedot';

import './JarjestelmatunnusEditPage.css';

export const JarjestelmatunnusEditPage = () => {
    const dispatch = useAppDispatch();
    const params = useParams();
    const { L } = useLocalisations();
    useTitle(L['JARJESTELMATUNNUKSEN_HALLINTA']);
    useNavigation(jarjestelmatunnusNavigation(params.oid), false);
    const existingKayttooikeusRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        dispatch<any>(clearHenkilo());
        dispatch<any>(fetchHenkilo(params.oid));
        dispatch<any>(fetchHenkiloOrgs(params.oid));
        dispatch<any>(fetchAllKayttooikeusryhmasForHenkilo(params.oid));
    }, [params.oid]);

    return (
        <OphDsPage header={L['JARJESTELMATUNNUKSEN_HALLINTA']}>
            <JarjestelmatunnusPerustiedot />
            <hr />
            <HenkiloViewOrganisationContent />
            <hr />
            <HenkiloViewExistingKayttooikeus
                existingKayttooikeusRef={existingKayttooikeusRef}
                vuosia={null}
                oidHenkilo={params.oid}
                isOmattiedot={false}
            />
            <hr />
            <HenkiloViewExpiredKayttooikeus oidHenkilo={params.oid} isOmattiedot={false} />
            <hr />
            <HenkiloViewCreateKayttooikeus
                oidHenkilo={params.oid}
                vuosia={null}
                existingKayttooikeusRef={existingKayttooikeusRef}
                isPalvelukayttaja={true}
            />
        </OphDsPage>
    );
};
