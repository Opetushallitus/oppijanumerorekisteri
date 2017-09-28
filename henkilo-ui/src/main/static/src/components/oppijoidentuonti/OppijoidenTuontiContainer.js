import React from 'react';
import {connect} from 'react-redux';
import {
    fetchOppijoidenTuontiYhteenveto,
    fetchOppijoidenTuontiListaus,
} from '../../actions/oppijoidentuonti.actions';
import OppijoidenTuontiYhteenveto from './OppijoidenTuontiYhteenveto';
import OppijoidenTuontiListaus from './OppijoidenTuontiListaus';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';

/**
 * Oppijoiden tuonti -näkymä.
 */
class OppijoidenTuontiContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            // oletushakukriteerit
            criteria: {
                page: 1,
                count: 20,
                vainVirheet: false,
            },
        };
    }

    render() {
        return (
            <div className="wrapper">
                <h1>{this.props.L['OPPIJOIDEN_TUONTI_YHTEENVETO_OTSIKKO']}</h1>
                <OppijoidenTuontiYhteenveto state={this.props.yhteenveto}
                                            L={this.props.L}>
                </OppijoidenTuontiYhteenveto>

                <div className="flex-horizontal">
                    <h1 className="flex-item-1">{this.props.L['OPPIJOIDEN_TUONTI_OPPIJAT_OTSIKKO']}</h1>
                    <div className="flex-item-1 flex-align-right">
                        <BooleanRadioButtonGroup value={this.state.criteria.vainVirheet}
                                                 onChange={this.onVainVirheetChange}
                                                 trueLabel={this.props.L['OPPIJOIDEN_TUONTI_NAYTA_VIRHEET']}
                                                 falseLabel={this.props.L['OPPIJOIDEN_TUONTI_NAYTA_KAIKKI']}>
                        </BooleanRadioButtonGroup>
                    </div>
                </div>

                <OppijoidenTuontiListaus state={this.props.listaus}
                                         onFetchData={this.onFetchData}
                                         L={this.props.L}>
                </OppijoidenTuontiListaus>
            </div>
        );
    }

    componentDidMount() {
        this.props.fetchOppijoidenTuontiYhteenveto();
    }

    onVainVirheetChange = (value) => {
        const criteria = {...this.state.criteria, vainVirheet: value};
        this.setState({criteria: criteria});
        this.props.fetchOppijoidenTuontiListaus(criteria);
    }

    onFetchData = (page, count) => {
        const criteria = {...this.state.criteria, page: page, count: count};
        this.setState({criteria: criteria});
        this.props.fetchOppijoidenTuontiListaus(criteria);
    }

};

const mapStateToProps = (state) => {
    return {
        yhteenveto: state.oppijoidenTuontiYhteenveto,
        listaus: state.oppijoidenTuontiListaus,
        L: state.l10n.localisations[state.locale],
    };
};

export default connect(mapStateToProps, {
        fetchOppijoidenTuontiYhteenveto,
        fetchOppijoidenTuontiListaus,
})(OppijoidenTuontiContainer);
