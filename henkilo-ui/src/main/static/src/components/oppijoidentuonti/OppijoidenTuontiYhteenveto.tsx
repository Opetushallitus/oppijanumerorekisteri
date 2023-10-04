import React from 'react';

import './OppijoidenTuontiYhteenveto.css';
import { useLocalisations } from '../../selectors';
import { useGetOppijoidentuontiYhteenvetoQuery } from '../../api/oppijanumerorekisteri';

const OppijoidenTuontiYhteenveto = () => {
    const { L } = useLocalisations();
    const { data, isFetching } = useGetOppijoidentuontiYhteenvetoQuery();
    return (
        <div className="oph-bg-gray-lighten-5">
            <dl className="side-by-side inverse">
                <dt>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_ONNISTUNEET']}</dt>
                <dd>{isFetching ? '...' : data.onnistuneet}</dd>
                <dt>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_VIRHEET']}</dt>
                <dd>{isFetching ? '...' : data.virheet}</dd>
                <dt>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_KESKENERAISET']}</dt>
                <dd>{isFetching ? '...' : data.keskeneraiset}</dd>
            </dl>
        </div>
    );
};

export default OppijoidenTuontiYhteenveto;
