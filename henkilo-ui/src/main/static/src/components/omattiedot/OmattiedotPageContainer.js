import React from 'react';
import {connect} from 'react-redux';
import OmattiedotPage from './OmattiedotPage';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, updateHenkiloAndRefetch,
    updateAndRefetchKayttajatieto,
    updatePassword, yksiloiHenkilo, clearHenkilo,
} from "../../actions/henkilo.actions";
import {fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import { fetchSukupuoliKoodisto, fetchKieliKoodisto, fetchKansalaisuusKoodisto, fetchYhteystietotyypitKoodisto } from '../../actions/koodisto.actions';
import { fetchAllOrganisaatios, fetchAllRyhmas } from '../../actions/organisaatio.actions';
import { fetchOrganisaatioKayttooikeusryhmat, createKayttooikeusanomus } from '../../actions/kayttooikeusryhma.actions';
import {updateEmptyNavigation} from "../../actions/navigation.actions";

class OmattiedotPageContainer extends React.Component {

    async componentDidMount() {
        this.props.clearHenkilo();

        this.props.updateEmptyNavigation();

        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchAllOrganisaatios();
        this.props.fetchAllRyhmas();
        await this.props.fetchOmattiedot();
        const userOid = this.props.omattiedot.data.oid;
        this.props.fetchHenkilo(userOid);
        this.props.fetchKayttajatieto(userOid);
        this.props.fetchHenkiloOrgs(userOid);
        this.props.fetchAllKayttooikeusryhmasForHenkilo(); // For current user
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
        kayttooikeus: state.kayttooikeus,
        organisaatios: state.organisaatio,
        ryhmas: state.ryhmatState,
        organisaatioCache: state.organisaatio.cached,
        organisaatioKayttooikeusryhmat: state.OrganisaatioKayttooikeusryhmat,
        notifications: state.notifications,
    };
};

export default connect(mapStateToProps, {fetchOmattiedot, fetchHenkilo, fetchHenkiloOrgs, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
    fetchKansalaisuusKoodisto, fetchSukupuoliKoodisto, updateHenkiloAndRefetch, fetchKayttajatieto, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateAndRefetchKayttajatieto, fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma, fetchAllOrganisaatios, fetchAllRyhmas, fetchOrganisaatioKayttooikeusryhmat, createKayttooikeusanomus,
    clearHenkilo, updateEmptyNavigation})(OmattiedotPageContainer)
