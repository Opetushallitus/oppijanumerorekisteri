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
    }

    render() {
        return (
          <div>
            <HaetutKayttooikeusRyhmatHakuForm {...this.props} onSubmit={this.onSubmit}></HaetutKayttooikeusRyhmatHakuForm>
            {
                this.props.haetutKayttooikeusryhmatLoading ? <Loader /> :
                  <HenkiloViewOpenKayttooikeusanomus {...this.props} updateHaettuKayttooikeusryhma={this.updateHaettuKayttooikeusryhma}></HenkiloViewOpenKayttooikeusanomus>
            }
          </div>
        );
    }

    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat(this.state.parameters);
        this.props.fetchAllOrganisaatios();
    }

    onSubmit = (criteria) => {
        const parameters = Object.assign({}, this.state.parameters, criteria);
        this.setState({
            parameters: parameters
        });
        this.props.fetchHaetutKayttooikeusryhmat(parameters);
    }

    updateHaettuKayttooikeusryhma = (id, kayttoOikeudenTila, alkupvm, loppupvm) => {
        this.props.updateHaettuKayttooikeusryhmaInAnomukset(id, kayttoOikeudenTila, alkupvm, loppupvm, this.state.parameters);
    }
};

export default AnomusPage;
