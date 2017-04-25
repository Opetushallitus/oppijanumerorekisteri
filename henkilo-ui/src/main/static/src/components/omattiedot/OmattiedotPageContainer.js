import React from 'react';
import {connect} from 'react-redux';
import OmattiedotPage from './OmattiedotPage';
import AbstractViewContainer from '../../containers/henkilo/AbstractViewContainer';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, updateHenkiloAndRefetch, updateAndRefetchKayttajatieto,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import {fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import { fetchSukupuoliKoodisto, fetchKieliKoodisto, fetchKansalaisuusKoodisto, fetchYhteystietotyypitKoodisto } from '../../actions/koodisto.actions';

class OmattiedotPageContainer extends AbstractViewContainer {

    async componentDidMount() {
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        await this.props.fetchOmattiedot();
        const userOid = this.props.omattiedot.data.oid;
        this.props.fetchHenkilo(userOid);
        this.props.fetchKayttajatieto(userOid);
        this.props.fetchHenkiloOrgs(userOid);
        this.props.fetchAllKayttooikeusryhmasForHenkilo(userOid);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(userOid);
    }

    render() {
        return <OmattiedotPage {...this.props} />;
    }


}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        omattiedot: state.omattiedot,
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus
    };
};

export default connect(mapStateToProps, {fetchOmattiedot, fetchHenkilo, fetchHenkiloOrgs, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
    fetchKansalaisuusKoodisto, fetchSukupuoliKoodisto, updateHenkiloAndRefetch, fetchKayttajatieto, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateAndRefetchKayttajatieto, fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma})(OmattiedotPageContainer)
