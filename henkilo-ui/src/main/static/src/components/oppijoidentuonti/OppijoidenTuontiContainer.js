// @flow

import React from 'react';
import {connect} from 'react-redux';
import {
    fetchOppijoidenTuontiYhteenveto,
    fetchOppijoidenTuontiListaus,
} from '../../actions/oppijoidentuonti.actions';
import OppijoidenTuontiYhteenveto from './OppijoidenTuontiYhteenveto';
import OppijoidenTuontiListaus from './OppijoidenTuontiListaus';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import type {OppijaTuontiYhteenveto} from "../../types/domain/oppijanumerorekisteri/oppijatuontiyhteenveto.types";
import type {Localisations} from "../../types/localisation.type";
import type {TuontiListausState} from "../../reducers/oppijoidentuonti.reducer";
import DelayedSearchInput from "../henkilohaku/DelayedSearchInput";


type SearchCriteria = {
    page: number,
    count: number,
    vainVirheet: boolean,
    sortDirection: string,
    sortKey: string,
    nimiHaku: ?string,
}

type OwnProps = {
}

type Props = {
    ...OwnProps,
    fetchOppijoidenTuontiYhteenveto: () => any,
    fetchOppijoidenTuontiListaus: (SearchCriteria) => any,
    yhteenveto: OppijaTuontiYhteenveto | {},
    L: Localisations,
    listaus: TuontiListausState,
    isOppijaHakuLoading: boolean,
}

type State = {
    criteria: SearchCriteria
}

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
                vainVirheet: false,
                sortDirection: 'DESC',
                sortKey: 'CREATED',
                nimiHaku: null,
            },
        };
    }

    render() {
        return (
            <div className="wrapper">
                <h1 style={{marginBottom: "20px"}}>{this.props.L['OPPIJOIDEN_TUONTI_YHTEENVETO_OTSIKKO']}</h1>
                <OppijoidenTuontiYhteenveto state={this.props.yhteenveto}
                                            L={this.props.L}>
                </OppijoidenTuontiYhteenveto>

                <div className="flex-horizontal" style={{margin: "20px 0"}}>
                    <h1 className="flex-item-1">{this.props.L['OPPIJOIDEN_TUONTI_OPPIJAT_OTSIKKO']}</h1>
                    <div className="flex-item-1 flex-align-right">
                        <BooleanRadioButtonGroup value={this.state.criteria.vainVirheet}
                                                 onChange={this.onVainVirheetChange}
                                                 trueLabel={this.props.L['OPPIJOIDEN_TUONTI_NAYTA_VIRHEET']}
                                                 falseLabel={this.props.L['OPPIJOIDEN_TUONTI_NAYTA_KAIKKI']}>
                        </BooleanRadioButtonGroup>
                    </div>
                </div>

                <DelayedSearchInput setSearchQueryAction={this.onChangeNimiHaku}
                                    loading={this.props.isOppijaHakuLoading}
                                    defaultNameQuery={this.state.criteria.nimiHaku}
                                    minSearchValueLength={2}
                                    placeholder={this.props.L['OPPIJOIDEN_TUONTI_HAE_HENKILOITA']}
                />

                <OppijoidenTuontiListaus state={this.props.listaus}
                                         onFetchData={this.onFetchData}
                                         onChangeSorting={this.onChangeSorting}
                                         sortDirection={this.state.criteria.sortDirection}
                                         sortKey={this.state.criteria.sortKey}
                                         L={this.props.L}>
                </OppijoidenTuontiListaus>
            </div>
        );
    }

    componentDidMount() {
        this.props.fetchOppijoidenTuontiYhteenveto();
    }

    onVainVirheetChange = (value: boolean) => {
        const criteria: SearchCriteria = {...this.state.criteria, vainVirheet: value, };
        this.setState({criteria: criteria});
        this.props.fetchOppijoidenTuontiListaus(criteria);
    };

    onChangeSorting = (sortKey: string, sortDirection: string) => {
        const page = this.state.criteria.page;
        const pageSize = this.state.criteria.count;
        const criteria: SearchCriteria = {...this.state.criteria, sortKey, sortDirection};
        this.setState( { criteria: criteria }, () => this.onFetchData(page, pageSize));
    };

    onChangeNimiHaku = (element: HTMLInputElement) => {
        const criteria: SearchCriteria = {...this.state.criteria, nimiHaku: element.value};
        this.setState( { criteria: criteria }, () => this.onFetchData(criteria.page, criteria.count));
    };

    onFetchData = (page: number, count: number) => {
        const criteria: SearchCriteria = {...this.state.criteria, page: page, count: count};
        this.setState({criteria: criteria});
        this.props.fetchOppijoidenTuontiListaus(criteria);
    };

}

const mapStateToProps = (state) => {
    return {
        yhteenveto: state.oppijoidenTuontiYhteenveto,
        listaus: state.oppijoidenTuontiListaus,
        L: state.l10n.localisations[state.locale],
        isOppijaHakuLoading: state.oppijoidenTuontiListaus.loading,
    };
};

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
        fetchOppijoidenTuontiYhteenveto,
        fetchOppijoidenTuontiListaus,
})(OppijoidenTuontiContainer);
