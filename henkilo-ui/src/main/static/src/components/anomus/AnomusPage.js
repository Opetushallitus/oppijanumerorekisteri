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
        this.state = {
            parameters: {
                tilat: ['ANOTTU'],
                orderBy: 'ANOTTU_PVM_DESC',
            },
            sorted: [],
        };
    };

    static propTypes = {
        kayttooikeus: React.PropTypes.shape({
            kayttooikeusAnomus: React.PropTypes.array.isRequired,
            grantableKayttooikeus: React.PropTypes.object.isRequired,
            grantableKayttooikeusLoading: React.PropTypes.bool.isRequired,
        }).isRequired,
    };

    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat(this.state.parameters);
        // For organisation filtering. Should fetch only user's organisations for normal users.
        if(this.props.isAdmin) {
            this.props.fetchAllOrganisaatios();
        }
    };

    render() {
        return (
          <div>
            <HaetutKayttooikeusRyhmatHakuForm {...this.props} onSubmit={this.onSubmit.bind(this)}/>
            {
                this.props.haetutKayttooikeusryhmatLoading
                    ? <Loader />
                    : <HenkiloViewOpenKayttooikeusanomus {...this.props}
                                                         updateHaettuKayttooikeusryhma={this.updateHaettuKayttooikeusryhma.bind(this)}
                                                         isAnomusView={true}
                                                         manualSortSettings={{
                                                             manual: true,
                                                             defaultSorted: this.state.sorted,
                                                             onFetchData: this.onTableFetch.bind(this)
                                                         }} />
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


    onSubmit = (criteria) => {
        const parameters = Object.assign({}, this.state.parameters, criteria);
        parameters.orderBy = this.state.sorted.length
            ? (this.state.sorted[0].desc ? this.state.sorted[0].id + '_DESC' : this.state.sorted[0].id + "_ASC")
            : this.state.parameters.orderBy;
        this.setState({
                parameters: parameters
            }, () => this.props.fetchHaetutKayttooikeusryhmat(parameters));
    };

    updateHaettuKayttooikeusryhma = (id, kayttoOikeudenTila, alkupvm, loppupvm) => {
        this.props.updateHaettuKayttooikeusryhmaInAnomukset(id, kayttoOikeudenTila, alkupvm, loppupvm, this.state.parameters);
    };
}

export default AnomusPage;
