import React from 'react'
import {connect} from 'react-redux'
import Loader from '../components/common/icons/Loader'
import AnomusPage from '../components/anomus/AnomusPage'
import {fetchHaetutKayttooikeusryhmat} from '../actions/anomus.actions'
import {fetchAllOrganisaatios} from '../actions/organisaatio.actions'
import {updateHaettuKayttooikeusryhmaInAnomukset} from '../actions/kayttooikeusryhma.actions'

class AnomusPageContainer extends React.Component {
    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat({
            tilat: ['ANOTTU']
        });
        this.props.fetchAllOrganisaatios();
    }
    render() {
        return (
          <div className="header">
            { this.props.haetutKayttooikeusryhmatLoading ? <Loader /> : <AnomusPage {...this.props}></AnomusPage> }
          </div>
        );
    }
};

const mapStateToProps = (state) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        kayttooikeus: {
            kayttooikeusAnomus: state.haetutKayttooikeusryhmat.data,
            grantableKayttooikeusLoading: true,
        },
        organisaatioCache: state.organisaatio.cached,
        haetutKayttooikeusryhmatLoading: state.haetutKayttooikeusryhmat.loading,
        organisaatiot: state.organisaatio.organisaatiot.organisaatiot,
    };
};

export default connect(mapStateToProps, {fetchHaetutKayttooikeusryhmat, fetchAllOrganisaatios, updateHaettuKayttooikeusryhmaInAnomukset})(AnomusPageContainer);
