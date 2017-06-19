import React from 'react';
import PropTypes from 'prop-types';
import HaetutKayttooikeusRyhmatHakuForm from './HaetutKayttooikeusRyhmatHakuForm'
import HenkiloViewOpenKayttooikeusanomus from "../common/henkilo/HenkiloViewOpenKayttooikeusanomus";

class AnomusPage extends React.Component {
    render() {
        return (
          <div>
            <HaetutKayttooikeusRyhmatHakuForm {...this.props} onSubmit={this.onSubmit}></HaetutKayttooikeusRyhmatHakuForm>
            <HenkiloViewOpenKayttooikeusanomus {...this.props}></HenkiloViewOpenKayttooikeusanomus>
          </div>
        );
    }

    onSubmit = (criteria) => {
        const parameters = Object.assign({}, criteria, {tilat: ['ANOTTU']});
        this.props.fetchHaetutKayttooikeusryhmat(parameters);
    }
};

export default AnomusPage;
