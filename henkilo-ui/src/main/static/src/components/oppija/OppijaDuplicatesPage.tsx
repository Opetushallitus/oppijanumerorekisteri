import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import {
    useGetHakemuksetQuery,
    useGetHenkiloDuplicatesQuery,
    useGetHenkiloQuery,
} from '../../api/oppijanumerorekisteri';
import HenkiloViewDuplikaatit from '../henkilo/duplikaatit/HenkiloViewDuplikaatit';
import Loader from '../common/icons/Loader';
import { oppijaNavigation } from '../navigation/navigationconfigurations';
import { OphDsPage } from '../design-system/OphDsPage';
import { OppijaTabs } from './OppijaTabs';

export const OppijaDuplicatesPage = () => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    const { L } = useLocalisations();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(oid);
    const { data: duplicates } = useGetHenkiloDuplicatesQuery({ L, oid });
    const { isLoading } = useGetHakemuksetQuery({ L, oid });

    useTitle(L('TITLE_DUPLIKAATTIHAKU'));
    useNavigation(oppijaNavigation, false);

    return (
        <OphDsPage header={`${henkilo?.sukunimi}, ${henkilo?.etunimet}`} tabs={<OppijaTabs oid={oid} />}>
            <h2>{L('DUPLIKAATIT_HEADER')}</h2>
            <p>
                <a className="oph-link" href={L('DUPLIKAATIT_OHJELINKKI_OSOITE')} target="_blank" rel="noreferrer">
                    {L('DUPLIKAATIT_OHJELINKKI_TEKSTI')}
                </a>
            </p>
            {isHenkiloLoading || isLoading || !henkilo || !duplicates ? (
                <Loader />
            ) : (
                <HenkiloViewDuplikaatit
                    vainLuku={false}
                    henkilo={{ ...henkilo, passinumerot: null }}
                    henkiloType="oppija"
                    duplicates={duplicates}
                    oidHenkilo={henkilo?.oidHenkilo}
                />
            )}
        </OphDsPage>
    );
};
