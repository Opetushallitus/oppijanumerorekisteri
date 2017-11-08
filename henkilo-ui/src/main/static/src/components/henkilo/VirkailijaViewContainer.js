import React from 'react'
import {connect} from 'react-redux';
import VirkailijaViewPage from "../../components/henkilo/VirkailijaViewPage";
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, passivoiHenkiloOrg, updateHenkiloAndRefetch,
    updateAndRefetchKayttajatieto, updatePassword, fetchHenkiloSlaves, unlinkHenkilo, clearHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {henkiloViewTabs} from "../navigation/NavigationTabs";
import {
    addKayttooikeusToHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo, fetchAllowedKayttooikeusryhmasForOrganisation, getGrantablePrivileges,
    removePrivilege,
    updateHaettuKayttooikeusryhma
} from "../../actions/kayttooikeusryhma.actions";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import EditButton from "../common/henkilo/buttons/EditButton";
import HakaButton from "../common/henkilo/buttons/HakaButton";
import PasswordButton from "../common/henkilo/buttons/PasswordButton";
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";
import Etunimet from "../common/henkilo/labelvalues/Etunimet";
import Sukunimi from "../common/henkilo/labelvalues/Sukunimi";
import Kutsumanimi from "../common/henkilo/labelvalues/Kutsumanimi";
import Oppijanumero from "../common/henkilo/labelvalues/Oppijanumero";
import Kayttajanimi from "../common/henkilo/labelvalues/Kayttajanimi";
import LinkitetytHenkilot from "../common/henkilo/labelvalues/LinkitetytHenkilot";
import {removeNotification} from "../../actions/notifications.actions";
import MasterHenkilo from "../common/henkilo/labelvalues/MasterHenkilo";

class VirkailijaViewContainer extends React.Component {
    componentDidMount() {
        this.props.clearHenkilo();
        if(this.props.oidHenkilo === this.props.ownOid) {
            this.props.router.push('/omattiedot');
        }
        if(this.props.isAdmin) {
            this.props.router.push('/admin/' + this.props.oidHenkilo);
        }
        else {
            const tabs = henkiloViewTabs(this.props.oidHenkilo, this.props.henkilo, 'virkailija');
            this.props.updateHenkiloNavigation(tabs);

            this.props.fetchHenkilo(this.props.oidHenkilo);
            this.props.fetchHenkiloOrgs(this.props.oidHenkilo);
            this.props.fetchKieliKoodisto();
            this.props.fetchKansalaisuusKoodisto();
            this.props.fetchSukupuoliKoodisto();
            this.props.fetchKayttajatieto(this.props.oidHenkilo);
            this.props.fetchYhteystietotyypitKoodisto();
            this.props.fetchAllKayttooikeusryhmasForHenkilo(this.props.oidHenkilo);
            this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.oidHenkilo);
            this.props.fetchOmattiedotOrganisaatios();

            this.props.getGrantablePrivileges(this.props.oidHenkilo);
        }
    };


    componentWillReceiveProps(nextProps) {
        const tabs = henkiloViewTabs(this.props.oidHenkilo, nextProps.henkilo, 'virkailija');
        this.props.updateHenkiloNavigation(tabs);
    }

    render() {
        const props = {...this.props, L: this.L, locale: this.props.locale, createBasicInfo: this._createBasicInfo,
            readOnlyButtons: this._readOnlyButtons,
        };
        return <VirkailijaViewPage {...props} />;
    };

    constructor(props) {
        super(props);
        this.L = this.props.l10n[this.props.locale];

        // Basic info box content
        this._createBasicInfo = (readOnly, updateModelAction, updateDateAction, henkiloUpdate) => {
            const props = {henkilo: this.props.henkilo, koodisto: this.props.koodisto, readOnly: readOnly,
                updateModelFieldAction: updateModelAction, updateDateFieldAction: updateDateAction,
                L: this.L, locale: this.props.locale,};

            const linkitetytHenkilotProps = {henkilo: this.props.henkilo, L: this.L, unlinkHenkilo: this.props.unlinkHenkilo,
                fetchHenkiloSlaves: this.props.fetchHenkiloSlaves };
            return [
                [
                    <Sukunimi {...props} autofocus={true} />,
                    <Etunimet {...props} />,
                    <Kutsumanimi {...props} />,
                    <Asiointikieli {...props} henkiloUpdate={henkiloUpdate} />,
                ],
                [
                    <Oppijanumero {...props} />,
                ],
                [
                    <Kayttajanimi {...props} disabled={true} />,
                    <LinkitetytHenkilot {...linkitetytHenkilotProps} />,
                    <MasterHenkilo henkilo={this.props.henkilo} oidHenkilo={this.props.oidHenkilo} />
                ],
            ]
        };

        // Basic info default buttons
        this._readOnlyButtons = (edit) => {
            const duplicate = this.props.henkilo.henkilo.duplicate;
            const passivoitu = this.props.henkilo.henkilo.passivoitu;
            return [
                <EditButton editAction={edit} L={this.L} disabled={duplicate | passivoitu}/>,
                <HakaButton oidHenkilo={this.props.oidHenkilo} disabled={duplicate | passivoitu} L={this.L} styles={{left: '0px', top: '3rem', width: '15rem', padding: '30px'}}/>,
                <PasswordButton oidHenkilo={this.props.oidHenkilo} L={this.L} disabled={duplicate | passivoitu} styles={{ top: '3rem', left: '0', width: '18rem' }} />,
            ];
        }

    };
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
        isAdmin: state.omattiedot.isAdmin,
        ownOid: state.omattiedot.data.oid,
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchHenkiloOrgs, fetchKieliKoodisto,
    fetchKansalaisuusKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto, updateHenkiloAndRefetch,
    fetchKayttajatieto, updatePassword, passivoiHenkilo, updateAndRefetchKayttajatieto, updateHenkiloNavigation,
    passivoiHenkiloOrg, fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma, fetchAllowedKayttooikeusryhmasForOrganisation, fetchOmattiedotOrganisaatios,
    addKayttooikeusToHenkilo, removeNotification, removePrivilege, getGrantablePrivileges, fetchHenkiloSlaves, unlinkHenkilo,
    clearHenkilo})(VirkailijaViewContainer);
