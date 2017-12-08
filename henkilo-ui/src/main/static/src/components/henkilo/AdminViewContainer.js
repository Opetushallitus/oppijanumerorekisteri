import React from 'react'
import {connect} from 'react-redux';
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, updatePassword, fetchHenkiloSlaves, clearHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {henkiloViewTabs} from "../navigation/NavigationTabs";
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
} from "../../actions/kayttooikeusryhma.actions";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import HenkiloViewPage from "./HenkiloViewPage";

class AdminViewContainer extends React.Component {
    componentDidMount() {
        this.props.clearHenkilo();
        if (this.props.oidHenkilo === this.props.ownOid) {
            this.props.router.push('/omattiedot');
        }

        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloOrgs(this.props.oidHenkilo);
        this.props.fetchHenkiloSlaves(this.props.oidHenkilo);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttajatieto(this.props.oidHenkilo);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(this.props.oidHenkilo);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.oidHenkilo);
        this.props.fetchOmattiedotOrganisaatios();
    };

    componentWillReceiveProps(nextProps) {
        const tabs = henkiloViewTabs(this.props.oidHenkilo, nextProps.henkilo, 'admin');
        this.props.updateHenkiloNavigation(tabs);
    }

    render() {
        const readOnlyButtons = this._readOnlyButtons;
        const props = {
            ...this.props,
            L: this.L,
            locale: this.props.locale,
            createBasicInfo: this._createBasicInfo,
            readOnlyButtons: readOnlyButtons,
            updatePassword: updatePassword,
        };
        return <HenkiloViewPage {...props} view="ADMIN" />;
    }

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        oidHenkilo: ownProps.params['oid'],
        henkiloType: ownProps.params['henkiloType'],
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
        notifications: state.notifications,
        ownOid: state.omattiedot.data.oid,
        isAdmin: state.omattiedot.isAdmin,
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchSukupuoliKoodisto,
    fetchYhteystietotyypitKoodisto,
    fetchKayttajatieto,
    updatePassword,
    updateHenkiloNavigation,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchOmattiedotOrganisaatios,
    fetchHenkiloSlaves,
    clearHenkilo})(AdminViewContainer);
