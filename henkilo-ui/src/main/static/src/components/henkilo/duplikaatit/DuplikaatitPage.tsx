import React from 'react';

import HenkiloViewDuplikaatit from './HenkiloViewDuplikaatit';
import Loader from '../../common/icons/Loader';
import type { HenkiloState } from '../../../reducers/henkilo.reducer';
import type { Localisations } from '../../../types/localisation.type';

type Props = {
    L: Localisations;
    henkiloType: string;
    henkilo: HenkiloState;
};

const DuplikaatitPage = (props: Props) => {
    const { L, henkiloType, henkilo } = props;
    return (
        <div className="mainContent wrapper">
            <span className="oph-h2 oph-bold">
                {L['DUPLIKAATIT_HEADER']}, {henkilo.henkilo.kutsumanimi} {henkilo.henkilo.sukunimi}
            </span>
            <p>
                <a className="oph-link" href={L['DUPLIKAATIT_OHJELINKKI_OSOITE']} target="_blank" rel="noreferrer">
                    {L['DUPLIKAATIT_OHJELINKKI_TEKSTI']}
                </a>
            </p>
            {!henkilo.henkiloLoading && !henkilo.hakemuksetLoading ? (
                <HenkiloViewDuplikaatit vainLuku={false} henkilo={henkilo} henkiloType={henkiloType} />
            ) : (
                <Loader />
            )}
        </div>
    );
};

export default DuplikaatitPage;
