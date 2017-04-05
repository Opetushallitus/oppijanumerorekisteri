import React from 'react'
import {connect} from 'react-redux';
import OppijaViewPage from "../../components/henkilo/OppijaViewPage";
import {
    fetchHenkilo, passivoiHenkilo, updateHenkiloAndRefetch, updateKayttajatieto,
    updatePassword, yksiloiHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";
import {updateNavigation} from "../../actions/navigation.actions";
import {oppijaNavi} from "../../configuration/navigationconfigurations";
import locale from '../../configuration/locale'
import AbstractViewContainer from "./AbstractViewContainer";


class OppijaViewContainer extends AbstractViewContainer {
    componentDidMount() {
        this.props.updateNavigation(oppijaNavi(this.props.oid), '/henkilo');

        this.props.fetchHenkilo(this.props.oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
    };
    render() {
        const props = {...this.props, L: this.L, locale: locale, isUserContentLoading: this._isUserContentLoading,
            isContactContentLoading: this._isContactContentLoading, createBasicInfo: this._createBasicInfo,
            createBasicInfo2: this._createBasicInfo2, createLoginInfo: this._createLoginInfo,
            readOnlyButtons: this._readOnlyButtons, editButtons: this._editButtons,
            creatableYhteystietotyypit: this._creatableYhteystietotyypit, createNotifications: this._createNotifications, };
        return <OppijaViewPage {...props} />;
    };
    constructor(props) {
        super(props);

        this.L = this.props.l10n[locale];

        // Functions bound to use this scope
        this._isUserContentLoading = this._isUserContentLoading.bind(this);
        this._isContactContentLoading = this._isContactContentLoading.bind(this);

        this._createNotifications = this._createNotifications.bind(this);
        this._createPopupErrorMessage = this._createPopupErrorMessage.bind(this);
        this._creatableYhteystietotyypit = this._creatableYhteystietotyypit.bind(this);

        this.createSukunimiFieldWithAutofocus = this.createSukunimiFieldWithAutofocus.bind(this);
        this.createEtunimetField = this.createEtunimetField.bind(this);
        this.createSyntymaaikaField = this.createSyntymaaikaField.bind(this);
        this.createHetuField = this.createHetuField.bind(this);
        this.createKutsumanimiField = this.createKutsumanimiField.bind(this);

        this.createKansalaisuusField = this.createKansalaisuusField.bind(this);
        this.createAidinkieliField = this.createAidinkieliField.bind(this);
        this.createOppijanumeroField = this.createOppijanumeroField.bind(this);
        this.createAsiointikieliField = this.createAsiointikieliField.bind(this);

        this.createEditButton = this.createEditButton.bind(this);
        this.createYksilointiButton = this.createYksilointiButton.bind(this);
        this.createPassivoiButton = this.createPassivoiButton.bind(this);

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
            this.createEditButton(edit),
            this.createYksilointiButton(),
            this.createPassivoiButton(),
        ];
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        oid: ownProps.params['oid'],
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
fetchKansalaisuusKoodisto, updateHenkiloAndRefetch, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateKayttajatieto, updateNavigation})(OppijaViewContainer);