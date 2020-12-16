import React from 'react';
import { OppijaTuontiYhteenveto } from '../../types/domain/oppijanumerorekisteri/oppijatuontiyhteenveto.types';
import './OppijoidenTuontiYhteenveto.css';

type Props = {
    // TODO: Typedef clearly b0rked --- revisit some day
    state: OppijaTuontiYhteenveto & { loading?: boolean; data?: OppijaTuontiYhteenveto };
    L: Record<string, string>;
};

/**
 * Oppijoiden tuonnin yhteenveto -boxi.
 */
class OppijoidenTuontiYhteenveto extends React.Component<Props> {
    render() {
        return (
            <div className="oph-bg-gray-lighten-5">
                {!this.props.state.loading && (
                    <dl className="side-by-side inverse">
                        <dt>{this.props.L['OPPIJOIDEN_TUONTI_YHTEENVETO_ONNISTUNEET']}</dt>
                        <dd>{this.props.state.data?.onnistuneet}</dd>
                        <dt>{this.props.L['OPPIJOIDEN_TUONTI_YHTEENVETO_VIRHEET']}</dt>
                        <dd>{this.props.state.data?.virheet}</dd>
                        <dt>{this.props.L['OPPIJOIDEN_TUONTI_YHTEENVETO_KESKENERAISET']}</dt>
                        <dd>{this.props.state.data?.keskeneraiset}</dd>
                    </dl>
                )}
            </div>
        );
    }
}

export default OppijoidenTuontiYhteenveto;
