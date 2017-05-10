import React from 'react'
import {connect} from 'react-redux';
import OppijaViewPage from "../../components/henkilo/OppijaViewPage";
import {
    fetchHenkilo, passivoiHenkilo, updateHenkiloAndRefetch, updateAndRefetchKayttajatieto,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";
import {updateNavigation} from "../../actions/navigation.actions";
import {oppijaNavi} from "../../configuration/navigationconfigurations";
import AbstractViewContainer from "../../containers/henkilo/AbstractViewContainer";
import YksiloiHetutonButton from "../common/henkilo/buttons/YksiloiHetutonButton";
import EditButton from "../common/henkilo/buttons/EditButton";
import PassivoiButton from "../common/henkilo/buttons/PassivoiButton";
import HakaButton from "../common/henkilo/buttons/HakaButton";


class OppijaViewContainer extends AbstractViewContainer {
    componentDidMount() {
        this.props.updateNavigation(oppijaNavi(this.props.oidHenkilo), '/henkilo');

        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
    };
    render() {
        const props = {...this.props, L: this.L, locale: this.props.locale, isUserContentLoading: this._isUserContentLoading,
            isContactContentLoading: this._isContactContentLoading, createBasicInfo: this._createBasicInfo,
            createBasicInfo2: this._createBasicInfo2, createLoginInfo: this._createLoginInfo,
            readOnlyButtons: this._readOnlyButtons, creatableYhteystietotyypit: this._creatableYhteystietotyypit.bind(this),
            createNotifications: this._createNotifications.bind(this), };
        return <OppijaViewPage {...props} />;
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        this._isUserContentLoading = () => this.props.henkilo.henkiloLoading || this.props.koodisto.kieliKoodistoLoading
            || this.props.koodisto.kansalaisuusKoodistoLoading;
        this._isContactContentLoading = () => this.props.henkilo.henkiloLoading || this.props.koodisto.yhteystietotyypitKoodistoLoading;

        // Basic info box content
        this._createBasicInfo = () => [
            this.createSukunimiFieldWithAutofocus(),
            this.createEtunimetField(),
            this.createSyntymaaikaField(),
            this.createHetuField(),
            this.createKutsumanimiField(),
        ];
        this._createBasicInfo2 = () => ([
            this.createKansalaisuusField(),
            this.createAidinkieliField(),
            this.createOppijanumeroField(),
            this.createAsiointikieliField(),
        ]);
        this._createLoginInfo = () => [];

        // Basic info default buttons
        this._readOnlyButtons = (edit) => [
            <EditButton editAction={edit} L={this.L} />,
            <YksiloiHetutonButton henkilo={this.props.henkilo} L={this.L} />,
            <PassivoiButton henkilo={this.props.henkilo} L={this.L} passivoiAction={this.props.passivoiHenkilo} />,
            <HakaButton oidHenkilo={this.props.oidHenkilo} L={this.L} />,
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
        locale: state.locale
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
fetchKansalaisuusKoodisto, updateHenkiloAndRefetch, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateAndRefetchKayttajatieto, updateNavigation})(OppijaViewContainer);