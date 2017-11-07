import React from 'react'
import {connect} from 'react-redux'
import AnomusPage from './AnomusPage'
import {clearHaetutKayttooikeusryhmat, fetchHaetutKayttooikeusryhmat} from '../../actions/anomus.actions'
import {fetchAllOrganisaatios, fetchAllRyhmas} from '../../actions/organisaatio.actions'
import {updateHaettuKayttooikeusryhmaInAnomukset, clearHaettuKayttooikeusryhma} from '../../actions/kayttooikeusryhma.actions'
import PropertySingleton from '../../globals/PropertySingleton'
import {fetchOmattiedotOrganisaatios} from '../../actions/omattiedot.actions'

class AnomusPageContainer extends React.Component {
    render() {
        return (
          <div className="header">
            <AnomusPage {...this.props}/>
          </div>
        );
    };
}

const mapStateToProps = (state) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        kayttooikeusAnomus: state.haetutKayttooikeusryhmat.data,
        kayttooikeusAnomusLoading: state.haetutKayttooikeusryhmat.isLoading,
        organisaatioCache: state.organisaatio.cached,
        haetutKayttooikeusryhmatLoading: state.haetutKayttooikeusryhmat.isLoading,
        organisaatiot: state.organisaatio.organisaatiot.organisaatiot,
        rootOrganisaatioOid: PropertySingleton.getState().rootOrganisaatioOid,
        isAdmin: state.omattiedot.isAdmin,
    };
};

export default connect(mapStateToProps, {
    fetchHaetutKayttooikeusryhmat,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
    updateHaettuKayttooikeusryhmaInAnomukset,
    clearHaettuKayttooikeusryhma,
    clearHaetutKayttooikeusryhmat,
    fetchOmattiedotOrganisaatios
})(AnomusPageContainer);
