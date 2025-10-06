import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { RootState, useAppDispatch } from '../../../store';
import { fetchHenkilo } from '../../../actions/henkilo.actions';
import { useLocalisations } from '../../../selectors';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';
import { henkiloViewTabs } from '../../navigation/NavigationTabs';
import { useSelector } from 'react-redux';
import { HenkiloState } from '../../../reducers/henkilo.reducer';
import {
    useGetHakemuksetQuery,
    useGetHenkiloDuplicatesQuery,
    useGetHenkiloMasterQuery,
} from '../../../api/oppijanumerorekisteri';
import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';
import Loader from '../../common/icons/Loader';

type OwnProps = {
    henkiloType?: string;
};

export const DuplikaatitContainer = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { oid } = useParams();
    const { L } = useLocalisations();
    const henkilo = useSelector<RootState, HenkiloState>((state) => state.henkilo);
    const { data: master } = useGetHenkiloMasterQuery(oid);
    const { data: duplicates } = useGetHenkiloDuplicatesQuery({ L, oid });
    const { isLoading } = useGetHakemuksetQuery({ L, oid });

    useTitle(L['TITLE_DUPLIKAATTIHAKU']);
    useNavigation(henkiloViewTabs(oid, henkilo, props.henkiloType, master?.oidHenkilo), true);

    useEffect(() => {
        dispatch<any>(fetchHenkilo(oid));
    }, []);

    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">
                {L['DUPLIKAATIT_HEADER']}, {henkilo.henkilo?.kutsumanimi} {henkilo.henkilo?.sukunimi}
            </span>
            <p>
                <a className="oph-link" href={L['DUPLIKAATIT_OHJELINKKI_OSOITE']} target="_blank" rel="noreferrer">
                    {L['DUPLIKAATIT_OHJELINKKI_TEKSTI']}
                </a>
            </p>
            {henkilo.henkiloLoading || isLoading ? (
                <Loader />
            ) : (
                <HenkiloViewDuplikaatit
                    vainLuku={false}
                    henkilo={henkilo.henkilo}
                    henkiloType={props.henkiloType}
                    duplicates={duplicates}
                    oidHenkilo={henkilo.henkilo?.oidHenkilo}
                />
            )}
        </div>
    );
};
