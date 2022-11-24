import React from 'react';
import { connect } from 'react-redux';
import type { RootState } from '../../reducers';
import { fetchOppijoidenTuontiYhteenveto, fetchOppijoidenTuontiListaus } from '../../actions/oppijoidentuonti.actions';
import OppijoidenTuontiYhteenveto from './OppijoidenTuontiYhteenveto';
import OppijoidenTuontiListaus from './OppijoidenTuontiListaus';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import { TuontiYhteenvetoState, TuontiListausState } from '../../reducers/oppijoidentuonti.reducer';
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput';
import TuontiKoosteTable from './TuontiKoosteTable';
import { TuontiKooste, TuontiKoosteCriteria } from '../../types/tuontikooste.types';
import { fetchTuontiKooste } from '../../actions/tuontikooste.actions';

type SearchCriteria = {
    page: number;
    count: number;
    sortDirection: string;
    sortKey: string;
    nimiHaku: string | null | undefined;
};

type StateProps = {
    yhteenveto: TuontiYhteenvetoState;
    listaus: TuontiListausState;
    isOppijaHakuLoading: boolean;
    tuontiKooste?: TuontiKooste;
    tuontiKoosteLoading: boolean;
    translate: (key: string) => string;
};

type DispatchProps = {
    fetchOppijoidenTuontiYhteenveto: () => void;
    fetchOppijoidenTuontiListaus: (criteria: SearchCriteria) => void;
    fetchTuontiKooste: (criteria: TuontiKoosteCriteria) => void;
};

type Props = StateProps & DispatchProps;

type State = {
    criteria: SearchCriteria;
    tuontikoosteCriteria: TuontiKoosteCriteria;
    tuontikooste: boolean;
};

/**
 * Oppijoiden tuonti -näkymä.
 */
class OppijoidenTuontiContainer extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            // oletushakukriteerit
            criteria: {
                page: 1,
                count: 20,
                sortDirection: 'DESC',
                sortKey: 'CREATED',
                nimiHaku: null,
            },
            tuontikoosteCriteria: {
                page: 1,
                pageSize: 20,
                field: 'id',
                sort: 'DESC',
            },
            tuontikooste: false,
        };
    }

    setTuontiKoostiCriteria(criteria: TuontiKoosteCriteria) {
        this.setState({ ...this.state, tuontikoosteCriteria: criteria });
    }

    render() {
        return (
            <div className="wrapper">
                <h1 style={{ marginBottom: '20px' }}>{this.props.translate('OPPIJOIDEN_TUONTI_YHTEENVETO_OTSIKKO')}</h1>
                <OppijoidenTuontiYhteenveto
                    state={this.props.yhteenveto}
                    translate={this.props.translate}
                ></OppijoidenTuontiYhteenveto>

                <div className="flex-horizontal" style={{ margin: '20px 0' }}>
                    <h1 className="flex-item-1">{this.props.translate('OPPIJOIDEN_TUONTI_OPPIJAT_OTSIKKO')}</h1>
                    <div className="flex-item-1 flex-align-right">
                        <BooleanRadioButtonGroup
                            value={this.state.tuontikooste}
                            onChange={() => this.setState({ ...this.state, tuontikooste: !this.state.tuontikooste })}
                            trueLabel={this.props.translate('OPPIJOIDEN_TUONTI_TUONTIKOOSTE')}
                            falseLabel={this.props.translate('OPPIJOIDEN_TUONTI_NAYTA_VIRHEET')}
                        ></BooleanRadioButtonGroup>
                    </div>
                </div>
                {this.state.tuontikooste ? (
                    <TuontiKoosteTable
                        fetch={this.props.fetchTuontiKooste}
                        criteria={this.state.tuontikoosteCriteria}
                        setCriteria={this.setTuontiKoostiCriteria.bind(this)}
                        loading={this.props.tuontiKoosteLoading}
                        data={this.props.tuontiKooste}
                        translate={this.props.translate}
                    />
                ) : (
                    <>
                        <DelayedSearchInput
                            setSearchQueryAction={this.onChangeNimiHaku}
                            loading={this.props.isOppijaHakuLoading}
                            defaultNameQuery={this.state.criteria.nimiHaku}
                            minSearchValueLength={2}
                            placeholder={this.props.translate('OPPIJOIDEN_TUONTI_HAE_HENKILOITA')}
                        />

                        <OppijoidenTuontiListaus
                            loading={this.props.isOppijaHakuLoading}
                            state={this.props.listaus}
                            onFetchData={this.onFetchData}
                            onChangeSorting={this.onChangeSorting}
                            sortDirection={this.state.criteria.sortDirection}
                            sortKey={this.state.criteria.sortKey}
                            translate={this.props.translate}
                        ></OppijoidenTuontiListaus>
                    </>
                )}
            </div>
        );
    }

    componentDidMount() {
        this.props.fetchOppijoidenTuontiYhteenveto();
    }

    onChangeSorting = (sortKey: string, sortDirection: string) => {
        const page = this.state.criteria.page;
        const pageSize = this.state.criteria.count;
        const criteria: SearchCriteria = {
            ...this.state.criteria,
            sortKey,
            sortDirection,
        };
        this.setState({ criteria: criteria }, () => this.onFetchData(page, pageSize));
    };

    onChangeNimiHaku = (element: HTMLInputElement) => {
        const criteria: SearchCriteria = {
            ...this.state.criteria,
            nimiHaku: element.value,
        };
        this.setState({ criteria: criteria }, () => this.onFetchData(criteria.page, criteria.count));
    };

    onFetchData = (page: number, count: number) => {
        const criteria: SearchCriteria = {
            ...this.state.criteria,
            page: page,
            count: count,
        };
        this.setState({ criteria: criteria });
        this.props.fetchOppijoidenTuontiListaus(criteria);
    };
}

const mapStateToProps = (state: RootState): StateProps => ({
    yhteenveto: state.oppijoidenTuontiYhteenveto,
    listaus: state.oppijoidenTuontiListaus,
    isOppijaHakuLoading: state.oppijoidenTuontiListaus.loading,
    tuontiKooste: state.tuontikooste.payload,
    tuontiKoosteLoading: state.tuontikooste.loading,
    translate: (key: string) => state.l10n.localisations[state.locale][key] || key,
});

export default connect<StateProps, DispatchProps, {}, RootState>(mapStateToProps, {
    fetchOppijoidenTuontiYhteenveto,
    fetchOppijoidenTuontiListaus,
    fetchTuontiKooste,
})(OppijoidenTuontiContainer);
