import React from 'react'
import {connect} from 'react-redux';
import VirkailijaViewPage from "../../components/henkilo/VirkailijaViewPage";
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, passivoiHenkilo, passivoiHenkiloOrg, updateHenkiloAndRefetch,
    updateAndRefetchKayttajatieto, updatePassword, yksiloiHenkilo,
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {updateNavigation} from "../../actions/navigation.actions";
import {virkailijaNavi} from "../../configuration/navigationconfigurations";
import AbstractViewContainer from "../../containers/henkilo/AbstractViewContainer";
import {
    addKayttooikeusToHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo, fetchAllowedKayttooikeusryhmasForOrganisation, updateHaettuKayttooikeusryhma
} from "../../actions/kayttooikeusryhma.actions";
import {fetchHenkiloOrganisaatiosForCurrentUser} from "../../actions/omattiedot.actions";
import EditButton from "../common/henkilo/buttons/EditButton";
import PassivoiButton from "../common/henkilo/buttons/PassivoiButton";
import HakaButton from "../common/henkilo/buttons/HakaButton";
import PasswordButton from "../common/henkilo/buttons/PasswordButton";
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";
import Etunimet from "../common/henkilo/labelvalues/Etunimet";
import Sukunimi from "../common/henkilo/labelvalues/Sukunimi";
import Kutsumanimi from "../common/henkilo/labelvalues/Kutsumanimi";
import Oppijanumero from "../common/henkilo/labelvalues/Oppijanumero";
import TyoSahkoposti from "../common/henkilo/labelvalues/TyoSahkoposti";
import TyoPuhelin from "../common/henkilo/labelvalues/TyoPuhelin";
import Kayttajanimi from "../common/henkilo/labelvalues/Kayttajanimi";


class VirkailijaViewContainer extends AbstractViewContainer {
    componentDidMount() {
        this.props.updateNavigation(virkailijaNavi(this.props.oidHenkilo), '/henkilo');

        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloOrgs(this.props.oidHenkilo);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttajatieto(this.props.oidHenkilo);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(this.props.oidHenkilo);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloOrganisaatiosForCurrentUser();
    };

    render() {
        const props = {...this.props, L: this.L, locale: this.props.locale, isUserContentLoading: this._isUserContentLoading,
            isOrganisationContentLoading: this._isOrganisationContentLoading, createBasicInfo: this._createBasicInfo,
            createNotifications: this._createNotifications.bind(this), readOnlyButtons: this._readOnlyButtons,
        };
        return <VirkailijaViewPage {...props} />;
    };

    constructor(props) {
        super(props);
        this.L = this.props.l10n[this.props.locale];
        this._isUserContentLoading = () => this.props.henkilo.henkiloLoading || this.props.koodisto.kieliKoodistoLoading
        || this.props.koodisto.kansalaisuusKoodistoLoading || this.props.koodisto.sukupuoliKoodistoLoading
        || this.props.henkilo.kayttajatietoLoading ||this.props.koodisto.yhteystietotyypitKoodistoLoading;
        this._isOrganisationContentLoading = () => this.props.henkilo.henkiloOrgsLoading;

        // Basic info box content
        this._createBasicInfo = (readOnly, updateModelAction, updateDateAction, henkiloUpdate) => {
            const props = {henkilo: this.props.henkilo, koodisto: this.props.koodisto, readOnly: readOnly,
                updateModelFieldAction: updateModelAction, updateDateFieldAction: updateDateAction,
                L: this.L, locale: this.props.locale,};
            return [
                [
                    <Sukunimi {...props} />,
                    <Etunimet {...props} />,
                    <Kutsumanimi {...props} />,
                    <Asiointikieli {...props} henkiloUpdate={henkiloUpdate} />,
                ],
                [
                    <Oppijanumero {...props} />,
                    <TyoSahkoposti {...props} henkiloUpdate={henkiloUpdate} />,
                    <TyoPuhelin {...props} henkiloUpdate={henkiloUpdate} />,
                ],
                [
                    <Kayttajanimi {...props} />,
                ],
            ]
        };

        // Basic info default buttons
        this._readOnlyButtons = (edit) => [
            <EditButton editAction={edit} L={this.L} />,
            <PassivoiButton henkilo={this.props.henkilo} L={this.L} passivoiAction={this.props.passivoiHenkilo} />,
            <HakaButton oidHenkilo={this.props.oidHenkilo} L={this.L} />,
            <PasswordButton L={this.L} />,
        ];

    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        oidHenkilo: ownProps.params['oid'],
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchHenkiloOrgs, fetchKieliKoodisto,
    fetchKansalaisuusKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto, updateHenkiloAndRefetch,
    fetchKayttajatieto, updatePassword, passivoiHenkilo, yksiloiHenkilo, updateAndRefetchKayttajatieto, updateNavigation,
    passivoiHenkiloOrg, fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma, fetchAllowedKayttooikeusryhmasForOrganisation, fetchHenkiloOrganisaatiosForCurrentUser,
    addKayttooikeusToHenkilo,})(VirkailijaViewContainer);
