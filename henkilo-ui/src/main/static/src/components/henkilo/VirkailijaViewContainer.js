import React from 'react'
import {connect} from 'react-redux';
import HenkiloViewPage from "../../components/henkilo/HenkiloViewPage";
import {
    fetchKayttaja,
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, clearHenkilo, fetchHenkiloSlaves
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {henkiloViewTabs} from "../navigation/NavigationTabs";
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo, getGrantablePrivileges,
    updateHaettuKayttooikeusryhma,
} from "../../actions/kayttooikeusryhma.actions";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";

class VirkailijaViewContainer extends React.Component {
    async componentDidMount() {
        this.props.clearHenkilo();
        const tabs = henkiloViewTabs(this.props.oidHenkilo, this.props.henkilo, 'virkailija');
        this.props.updateHenkiloNavigation(tabs);

        await this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloOrgs(this.props.oidHenkilo);
        this.props.fetchHenkiloSlaves(this.props.oidHenkilo);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttaja(this.props.oidHenkilo);
        this.props.fetchKayttajatieto(this.props.oidHenkilo);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(this.props.oidHenkilo);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.oidHenkilo);
        this.props.fetchOmattiedotOrganisaatios();

        this.props.getGrantablePrivileges(this.props.oidHenkilo);
    };


    componentWillReceiveProps(nextProps) {
        const tabs = henkiloViewTabs(this.props.oidHenkilo, nextProps.henkilo, 'virkailija');
        this.props.updateHenkiloNavigation(tabs);
    }

    render() {
        return <HenkiloViewPage {...this.props} view="VIRKAILIJA" />;
    };

}

const mapStateToProps = (state) => {
    return {
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
        notifications: state.notifications
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchHenkiloOrgs,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchSukupuoliKoodisto,
    fetchYhteystietotyypitKoodisto,
    fetchKayttaja,
    fetchKayttajatieto,
    updateHenkiloNavigation,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchOmattiedotOrganisaatios,
    getGrantablePrivileges,
    clearHenkilo})(VirkailijaViewContainer);
