import React from 'react';

import { useLocalisations } from '../../selectors';
import { useGetOppijoidentuontiYhteenvetoQuery } from '../../api/oppijanumerorekisteri';

const OppijoidenTuontiYhteenveto = () => {
    const { L } = useLocalisations();
    const { data, isFetching } = useGetOppijoidentuontiYhteenvetoQuery();
    return (
        <div className="oph-bg-gray-lighten-5">
            <table>
                <tbody>
                    <tr>
                        <td>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_ONNISTUNEET']}</td>
                        <td style={{ paddingLeft: '1rem', fontWeight: 600 }}>
                            {isFetching ? '...' : data.onnistuneet}
                        </td>
                    </tr>
                    <tr>
                        <td>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_VIRHEET']}</td>
                        <td style={{ paddingLeft: '1rem', fontWeight: 600 }}>{isFetching ? '...' : data.virheet}</td>
                    </tr>
                    <tr>
                        <td>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_KESKENERAISET']}</td>
                        <td style={{ paddingLeft: '1rem', fontWeight: 600 }}>
                            {isFetching ? '...' : data.keskeneraiset}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default OppijoidenTuontiYhteenveto;
