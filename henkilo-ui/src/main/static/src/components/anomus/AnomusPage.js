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
            parameters: {tilat: ['ANOTTU']}
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
                                                         isAnomusView={true} />
            }
          </div>
        );
    };

    onSubmit = (criteria) => {
        const parameters = Object.assign({}, this.state.parameters, criteria);
        this.setState({
                parameters: parameters
            },
            () => this.props.fetchHaetutKayttooikeusryhmat(parameters));
    };

    updateHaettuKayttooikeusryhma = (id, kayttoOikeudenTila, alkupvm, loppupvm) => {
        this.props.updateHaettuKayttooikeusryhmaInAnomukset(id, kayttoOikeudenTila, alkupvm, loppupvm, this.state.parameters);
    };
}

export default AnomusPage;
