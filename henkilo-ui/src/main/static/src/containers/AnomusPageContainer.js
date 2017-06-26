import React from 'react'
import {connect} from 'react-redux'
import AnomusPage from '../components/anomus/AnomusPage'
import {fetchHaetutKayttooikeusryhmat} from '../actions/anomus.actions'
import {fetchAllOrganisaatios} from '../actions/organisaatio.actions'
import {updateHaettuKayttooikeusryhmaInAnomukset} from '../actions/kayttooikeusryhma.actions'

class AnomusPageContainer extends React.Component {
    render() {
        return (
          <div className="header">
            <AnomusPage {...this.props}></AnomusPage>
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
        rootOrganisaatioOid: '1.2.246.562.10.00000000001',
    };
};

export default connect(mapStateToProps, {
        fetchHaetutKayttooikeusryhmat,
        fetchAllOrganisaatios,
        updateHaettuKayttooikeusryhmaInAnomukset
    })(AnomusPageContainer);
