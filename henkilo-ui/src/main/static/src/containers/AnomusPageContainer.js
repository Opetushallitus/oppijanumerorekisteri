import React from 'react'
import {connect} from 'react-redux'
import Loader from '../components/common/icons/Loader'
import AnomusPage from '../components/anomus/AnomusPage'
import {fetchHaetutKayttooikeusryhmat} from '../actions/anomus.actions'
import {updateHaettuKayttooikeusryhma} from '../actions/kayttooikeusryhma.actions'

class AnomusPageContainer extends React.Component {
    componentDidMount() {
        this.props.fetchHaetutKayttooikeusryhmat({
            tilat: ['ANOTTU']
        });
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
    };
};

export default connect(mapStateToProps, {fetchHaetutKayttooikeusryhmat, updateHaettuKayttooikeusryhma})(AnomusPageContainer);
