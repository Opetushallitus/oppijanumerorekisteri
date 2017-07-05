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
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {oppijaNavi} from "../../configuration/navigationconfigurations";
import YksiloiHetutonButton from "../common/henkilo/buttons/YksiloiHetutonButton";
import EditButton from "../common/henkilo/buttons/EditButton";
import PassivoiButton from "../common/henkilo/buttons/PassivoiButton";
import Sukunimi from "../common/henkilo/labelvalues/Sukunimi";
import Syntymaaika from "../common/henkilo/labelvalues/Syntymaaika";
import Kutsumanimi from "../common/henkilo/labelvalues/Kutsumanimi";
import Etunimet from "../common/henkilo/labelvalues/Etunimet";
import Hetu from "../common/henkilo/labelvalues/Hetu";
import Kansalaisuus from "../common/henkilo/labelvalues/Kansalaisuus";
import Aidinkieli from "../common/henkilo/labelvalues/Aidinkieli";
import Oppijanumero from "../common/henkilo/labelvalues/Oppijanumero";
import Asiointikieli from "../common/henkilo/labelvalues/Asiointikieli";
import PropertySingleton from '../../globals/PropertySingleton'


class OppijaViewContainer extends React.Component {
    componentDidMount() {
        PropertySingleton.setState({externalPermissionService: this.props.externalPermissionService});

        if(this.props.isAdmin) {
            this.props.router.push('/admin/' + this.props.oidHenkilo);
        }
        else {
            this.props.updateHenkiloNavigation(oppijaNavi(this.props.oidHenkilo));

            this.props.fetchHenkilo(this.props.oidHenkilo);
            this.props.fetchYhteystietotyypitKoodisto();
            this.props.fetchKieliKoodisto();
            this.props.fetchKansalaisuusKoodisto();
        }
    };

    render() {
        const props = {...this.props, L: this.L, locale: this.props.locale, createBasicInfo: this._createBasicInfo,
            readOnlyButtons: this._readOnlyButtons, };
        return <OppijaViewPage {...props} />;
    };

    constructor(props) {
        super(props);

        this.L = this.props.l10n[this.props.locale];

        // Basic info box content
        this._createBasicInfo = (readOnly, updateModelAction, updateDateAction, henkiloUpdate) => {
            const props = {henkilo: this.props.henkilo, koodisto: this.props.koodisto, readOnly: readOnly,
                updateModelFieldAction: updateModelAction, updateDateFieldAction: updateDateAction,
                L: this.L, locale: this.props.locale,};
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

                ],
            ];
        };

        // Basic info default buttons
        this._readOnlyButtons = (edit) => [
            <EditButton editAction={edit} L={this.L} />,
            <YksiloiHetutonButton henkilo={this.props.henkilo} L={this.L} yksiloiAction={this.props.yksiloiHenkilo} />,
            <PassivoiButton henkilo={this.props.henkilo} L={this.L} passivoiAction={this.props.passivoiHenkilo} />,
        ];
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        oidHenkilo: ownProps.params['oid'],
        externalPermissionService: ownProps.location.query.permissionCheckService,
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        isAdmin: state.omattiedot.isAdmin,
    };
};

export default connect(mapStateToProps, {fetchHenkilo, fetchYhteystietotyypitKoodisto, fetchKieliKoodisto,
fetchKansalaisuusKoodisto, updateHenkiloAndRefetch, updatePassword, passivoiHenkilo,
    yksiloiHenkilo, updateAndRefetchKayttajatieto, updateHenkiloNavigation})(OppijaViewContainer);