import React from 'react';
import {connect} from 'react-redux';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, clearHenkilo,
} from "../../actions/henkilo.actions";
import {fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo, updateHaettuKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import { fetchSukupuoliKoodisto, fetchKieliKoodisto, fetchKansalaisuusKoodisto, fetchYhteystietotyypitKoodisto } from '../../actions/koodisto.actions';
import {
    fetchAllHierarchialOrganisaatios, fetchAllOrganisaatios,
    fetchAllRyhmas
} from '../../actions/organisaatio.actions';
import {updateEmptyNavigation} from "../../actions/navigation.actions";
import HenkiloViewPage from "../henkilo/HenkiloViewPage";

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
        this.props.fetchAllHierarchialOrganisaatios();
        await this.props.fetchOmattiedot();
        const userOid = this.props.omattiedot.data.oid;
        this.props.fetchHenkilo(userOid);
        this.props.fetchKayttajatieto(userOid);
        this.props.fetchHenkiloOrgs(userOid);
        this.props.fetchAllKayttooikeusryhmasForHenkilo(); // For current user
        this.props.fetchAllKayttooikeusAnomusForHenkilo(userOid);
    }

    render() {
        return <HenkiloViewPage {...this.props} view="OMATTIEDOT" />;
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

export default connect(mapStateToProps, {fetchOmattiedot,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchYhteystietotyypitKoodisto,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchSukupuoliKoodisto,
    fetchKayttajatieto,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
    fetchAllHierarchialOrganisaatios,
    clearHenkilo,
    updateEmptyNavigation})(OmattiedotPageContainer)
