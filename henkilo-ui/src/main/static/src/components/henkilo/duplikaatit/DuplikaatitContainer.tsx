import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';
import { henkiloViewTabs } from '../../navigation/NavigationTabs';
import {
    useGetHakemuksetQuery,
    useGetHenkiloDuplicatesQuery,
    useGetHenkiloMasterQuery,
    useGetHenkiloQuery,
} from '../../../api/oppijanumerorekisteri';
import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';
import Loader from '../../common/icons/Loader';

type OwnProps = {
    henkiloType: 'virkailija' | 'oppija';
};

export const DuplikaatitContainer = (props: OwnProps) => {
    const { oid } = useParams();
    if (!oid) {
        return;
    }

    const { L } = useLocalisations();
    const { data: henkilo, isLoading: isHenkiloLoading } = useGetHenkiloQuery(oid);
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const { data: duplicates } = useGetHenkiloDuplicatesQuery({ L, oid });
    const { isLoading } = useGetHakemuksetQuery({ L, oid });

    useTitle(L('TITLE_DUPLIKAATTIHAKU'));
    useNavigation(henkiloViewTabs(oid, henkilo, props.henkiloType, master?.oidHenkilo), true);

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">
                {L('DUPLIKAATIT_HEADER')}, {henkilo?.kutsumanimi} {henkilo?.sukunimi}
            </span>
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
                    henkiloType={props.henkiloType}
                    duplicates={duplicates}
                    oidHenkilo={henkilo?.oidHenkilo}
                />
            )}
        </div>
    );
};
