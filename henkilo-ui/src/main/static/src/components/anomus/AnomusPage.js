import React from 'react';
import Loader from '../common/icons/Loader'
import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm'
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";

/**
 * Haettujen käyttöoikeusryhmien haku ja myöntäminen/hylkääminen.
 */
class AnomusPage extends React.Component {
    constructor(props) {
        super(props);

        this.defaultLimit = 20;
        this.defaultOffset = 0;

        this.state = {
            parameters: {
                tilat: ['ANOTTU'],
                orderBy: 'ANOTTU_PVM_DESC',
                limit: this.defaultLimit,
                showOwnAnomus: false,
            },
            sorted: [{id: 'ANOTTU_PVM', desc: false}],
            allFetched: false,
            page: 0,
            kayttooikeus: {},
        };
    };

    static propTypes = {
        l10n: React.PropTypes.object.isRequired,
        locale: React.PropTypes.string.isRequired,
        kayttooikeusAnomus: React.PropTypes.array.isRequired,
        organisaatioCache: React.PropTypes.object.isRequired,
        clearHaetutKayttooikeusryhmat: React.PropTypes.func.isRequired,
        fetchAllOrganisaatios: React.PropTypes.func.isRequired,
        fetchHaetutKayttooikeusryhmat: React.PropTypes.func.isRequired,
        isAdmin: React.PropTypes.bool.isRequired,
    };

    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat(this.state.parameters);
        // For organisation filtering. Should fetch only user's organisations for normal users.
        if(this.props.isAdmin) {
            this.props.fetchAllOrganisaatios();
        }
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            allFetched: !nextProps.haetutKayttooikeusryhmatLoading
            && (nextProps.kayttooikeusAnomus.length < this.defaultLimit
            || nextProps.kayttooikeusAnomus.length === this.props.kayttooikeusAnomus.length),
        });

        if(!this.props.haetutKayttooikeusryhmatLoading) {
            this.initialised = true;
        }
    };

    render() {
        return (
          <div>
              <HaetutKayttooikeusRyhmatHakuForm {...this.props} onSubmit={this.onSubmit.bind(this)}/>
              {
                  this.props.haetutKayttooikeusryhmatLoading && !this.initialised
                      ? <Loader />
                      : <HenkiloViewOpenKayttooikeusanomus kayttooikeus={{kayttooikeusAnomus: this.props.kayttooikeusAnomus, grantableKayttooikeus: {},grantableKayttooikeusLoading: true,}}
                                                           l10n={this.props.l10n}
                                                           locale={this.props.locale}
                                                           organisaatioCache={this.props.organisaatioCache}
                                                           updateHaettuKayttooikeusryhma={this.updateHaettuKayttooikeusryhma.bind(this)}
                                                           isAnomusView={true}
                                                           manualSortSettings={{
                                                               manual: true,
                                                               defaultSorted: this.state.sorted,
                                                               onFetchData: this.onTableFetch.bind(this)
                                                           }}
                                                           fetchMoreSettings={{
                                                               isActive: !this.state.allFetched && !this.props.haetutKayttooikeusryhmatLoading,
                                                               fetchMoreAction: this.onSubmitWithoutClear.bind(this),
                                                           }}
                                                           tableLoading={this.props.haetutKayttooikeusryhmatLoading} />
              }
          </div>
        );
    };

    onTableFetch(tableState, instance) {
        const sort = tableState.sorted[0];
        const stateSort = this.state.sorted[0];
        // Update sort state
        if(sort) {
            this.setState({
                sorted: [Object.assign({}, sort)],
            });
            // If sort state changed fetch new data
            if(!stateSort || sort.id !== stateSort.id || sort.desc !== stateSort.desc) {
                this.onSubmit();
            }
        }
    };

    onSubmitWithoutClear(criteria) {
        this.onSubmit(criteria, true);
    };

    onSubmit = (criteria, shouldNotClear) => {
        if(!shouldNotClear) {
            this.props.clearHaetutKayttooikeusryhmat();
        }
        const parameters = Object.assign({}, this.state.parameters, criteria);
        parameters.orderBy = this.state.sorted.length
            ? (this.state.sorted[0].desc ? this.state.sorted[0].id + '_ASC' : this.state.sorted[0].id + "_DESC")
            : this.state.parameters.orderBy;
        parameters.offset = shouldNotClear ? this.defaultLimit * (this.state.page+1) : this.defaultOffset;
        this.setState({
            parameters: parameters,
            page: shouldNotClear ? this.state.page+1 : 0,
        }, () => this.props.fetchHaetutKayttooikeusryhmat(parameters));
    };

    updateHaettuKayttooikeusryhma = (id, kayttoOikeudenTila, alkupvm, loppupvm) => {
        this.props.updateHaettuKayttooikeusryhmaInAnomukset(id, kayttoOikeudenTila, alkupvm, loppupvm, this.state.parameters);
    };
}

export default AnomusPage;
