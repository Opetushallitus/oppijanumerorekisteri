import React from 'react';
import type { TuontiYhteenvetoState } from '../../reducers/oppijoidentuonti.reducer';
import './OppijoidenTuontiYhteenveto.css';

type Props = {
    state: TuontiYhteenvetoState;
    translate: (key: string) => string;
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
                        <dt>{this.props.translate('OPPIJOIDEN_TUONTI_YHTEENVETO_ONNISTUNEET')}</dt>
                        <dd>{this.props.state.data.onnistuneet}</dd>
                        <dt>{this.props.translate('OPPIJOIDEN_TUONTI_YHTEENVETO_VIRHEET')}</dt>
                        <dd>{this.props.state.data.virheet}</dd>
                        <dt>{this.props.translate('OPPIJOIDEN_TUONTI_YHTEENVETO_KESKENERAISET')}</dt>
                        <dd>{this.props.state.data.keskeneraiset}</dd>
                    </dl>
                )}
            </div>
        );
    }
}

export default OppijoidenTuontiYhteenveto;
