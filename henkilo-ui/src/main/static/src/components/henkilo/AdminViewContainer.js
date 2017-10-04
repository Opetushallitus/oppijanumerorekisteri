import React from 'react'
import {connect} from 'react-redux';
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, passivoiHenkiloOrg, updateHenkiloAndRefetch,
    updateAndRefetchKayttajatieto, updatePassword, yksiloiHenkilo, puraYksilointi, overrideHenkiloVtjData, fetchHenkiloSlaves,
    unlinkHenkilo, clearHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {henkiloViewTabs} from "../NavigationTabs";
import {
    addKayttooikeusToHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo, fetchAllowedKayttooikeusryhmasForOrganisation, removePrivilege,
    updateHaettuKayttooikeusryhma
} from "../../actions/kayttooikeusryhma.actions";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import EditButton from "../common/henkilo/buttons/EditButton";
import PassivoiButton from "../common/henkilo/buttons/PassivoiButton";
import HakaButton from "../common/henkilo/buttons/HakaButton";
import PasswordButton from "../common/henkilo/buttons/PasswordButton";
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";
import Etunimet from "../common/henkilo/labelvalues/Etunimet";
import Sukunimi from "../common/henkilo/labelvalues/Sukunimi";
import LinkitetytHenkilot from "../common/henkilo/labelvalues/LinkitetytHenkilot";
import Kutsumanimi from "../common/henkilo/labelvalues/Kutsumanimi";
import Oppijanumero from "../common/henkilo/labelvalues/Oppijanumero";
import Kayttajanimi from "../common/henkilo/labelvalues/Kayttajanimi";
import {removeNotification} from "../../actions/notifications.actions";
import YksiloiHetutonButton from "../common/henkilo/buttons/YksiloiHetutonButton";
import Syntymaaika from "../common/henkilo/labelvalues/Syntymaaika";
import Hetu from "../common/henkilo/labelvalues/Hetu";
import Kansalaisuus from "../common/henkilo/labelvalues/Kansalaisuus";
import Aidinkieli from "../common/henkilo/labelvalues/Aidinkieli";
import AdminViewPage from "./AdminViewPage";
import VtjOverrideButton from "../common/henkilo/buttons/VtjOverrideButton";
import MasterHenkilo from "../common/henkilo/labelvalues/MasterHenkilo";
import PuraHetuttomanYksilointiButton from "../common/henkilo/buttons/PuraHetuttomanYksilointi";


class AdminViewContainer extends React.Component {
    componentDidMount() {
        this.props.clearHenkilo();
        if(this.props.oidHenkilo === this.props.ownOid) {
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
        const props = {...this.props, L: this.L, locale: this.props.locale, createBasicInfo: this._createBasicInfo,
            readOnlyButtons: this._readOnlyButtons, updatePassword: updatePassword,
        };
        return <AdminViewPage {...props} />;
    };

    constructor(props) {
        super(props);
        this.L = this.props.l10n[this.props.locale];

        // Basic info box content
        this._createBasicInfo = (readOnly, updateModelAction, updateDateAction, henkiloUpdate) => {
            const props = {henkilo: this.props.henkilo, koodisto: this.props.koodisto, readOnly: readOnly,
                updateModelFieldAction: updateModelAction, updateDateFieldAction: updateDateAction,
                L: this.L, locale: this.props.locale,};
            const linkitetytProps = {henkilo: this.props.henkilo, L: this.L, unlinkHenkilo: this.props.unlinkHenkilo,
                fetchHenkiloSlaves: this.props.fetchHenkiloSlaves};
            return [
                [
                    <Sukunimi {...props} autofocus={true} />,
                    <Etunimet {...props} />,
                    <Syntymaaika {...props} />,
                    <Hetu {...props} />,
                    <Kutsumanimi {...props} />,
                ],
                [
                    <Kansalaisuus {...props} henkiloUpdate={henkiloUpdate} />,
                    <Aidinkieli {...props} henkiloUpdate={henkiloUpdate} />,
                    <Oppijanumero {...props} />,
                    <Asiointikieli {...props} henkiloUpdate={henkiloUpdate} />,
                ],
                [
                    <Kayttajanimi {...props} disabled={true} />,
                    <LinkitetytHenkilot {...linkitetytProps} />,
                    <MasterHenkilo henkilo={this.props.henkilo} oidHenkilo={this.props.oidHenkilo} />
                ],
            ]
        };

        // Basic info default buttons
        this._readOnlyButtons = (edit) => ([
            <EditButton editAction={edit} L={this.L}/>,
            <YksiloiHetutonButton yksiloiAction={this.props.yksiloiHenkilo} henkilo={this.props.henkilo}
                                  L={this.L}/>,
            <PuraHetuttomanYksilointiButton puraYksilointiAction={this.props.puraYksilointi} henkilo={this.props.henkilo} L={this.L}>
            </PuraHetuttomanYksilointiButton>,
            <PassivoiButton henkilo={this.props.henkilo} L={this.L} passivoiAction={this.props.passivoiHenkilo}/>,
            <HakaButton oidHenkilo={this.props.oidHenkilo}
                        styles={{left: '0px', top: '3rem', width: '15rem', padding: '30px'}} L={this.L}/>,
            <VtjOverrideButton henkilo={this.props.henkilo} L={this.L}
                               overrideAction={this.props.overrideHenkiloVtjData}/>,
            <PasswordButton oidHenkilo={this.props.oidHenkilo} L={this.L}
                            styles={{top: '3rem', left: '0', width: '18rem'}}/>,
        ]);
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
        ownOid: state.omattiedot.data.oid,
        omattiedot: state.omattiedot,
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchHenkiloOrgs, fetchKieliKoodisto,
    fetchKansalaisuusKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto, updateHenkiloAndRefetch,
    fetchKayttajatieto, updatePassword, passivoiHenkilo, yksiloiHenkilo, puraYksilointi, updateAndRefetchKayttajatieto, updateHenkiloNavigation,
    passivoiHenkiloOrg, fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma, fetchAllowedKayttooikeusryhmasForOrganisation, fetchOmattiedotOrganisaatios,
    addKayttooikeusToHenkilo, removeNotification, overrideHenkiloVtjData, removePrivilege, fetchHenkiloSlaves, unlinkHenkilo,
    clearHenkilo})(AdminViewContainer);
