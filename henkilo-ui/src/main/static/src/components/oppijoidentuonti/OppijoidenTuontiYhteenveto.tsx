import React from 'react';

import { useLocalisations } from '../../selectors';
import { useGetOppijoidentuontiYhteenvetoQuery } from '../../api/oppijanumerorekisteri';

const OppijoidenTuontiYhteenveto = () => {
    const { L } = useLocalisations();
    const { data, isFetching } = useGetOppijoidentuontiYhteenvetoQuery();
    return (
        <div className="oph-ds-card-light" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '8px' }}>
            <div style={{ fontWeight: 'bold' }}>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_ONNISTUNEET']}</div>
            <div>{isFetching ? '...' : data?.onnistuneet}</div>
            <div style={{ fontWeight: 'bold' }}>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_VIRHEET']}</div>
            <div>{isFetching ? '...' : data?.virheet}</div>
            <div style={{ fontWeight: 'bold' }}>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_KESKENERAISET']}</div>
            <div>{isFetching ? '...' : data?.keskeneraiset}</div>
        </div>
    );
};

export default OppijoidenTuontiYhteenveto;
