import React from 'react'
import {connect} from 'react-redux';
import {
    fetchHenkilo, passivoiHenkilo, updateHenkiloAndRefetch, updateAndRefetchKayttajatieto,
    updatePassword, yksiloiHenkilo, fetchHenkiloSlaves, unlinkHenkilo,
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {oppijaNavi} from "../navigation/navigationconfigurations";
import PropertySingleton from '../../globals/PropertySingleton'
import LinkitetytHenkilot from "../common/henkilo/labelvalues/LinkitetytHenkilot"
import MasterHenkilo from "../common/henkilo/labelvalues/MasterHenkilo"
import HenkiloViewPage from "./HenkiloViewPage";


class OppijaViewContainer extends React.Component {
    componentDidMount() {
        PropertySingleton.setState({externalPermissionService: this.props.externalPermissionService});

        if(this.props.isAdmin) {
            this.props.router.push('/admin/' + this.props.oidHenkilo);
        }
        else {
            this.props.updateHenkiloNavigation(oppijaNavi(this.props.oidHenkilo));

            this.props.fetchHenkilo(this.props.oidHenkilo);
            this.props.fetchHenkiloSlaves(this.props.oidHenkilo);
            this.props.fetchYhteystietotyypitKoodisto();
            this.props.fetchKieliKoodisto();
            this.props.fetchKansalaisuusKoodisto();
        }
    }

    render() {
        const props = {
            ...this.props,
            L: this.L,
            locale: this.props.locale,
            createBasicInfo: this._createBasicInfo,
            readOnlyButtons: this._readOnlyButtons,
            view: 'OPPIJA',
        };
        return <HenkiloViewPage {...props} />;
    }

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
                    <LinkitetytHenkilot {...linkitetytHenkilotProps} />,
                    <MasterHenkilo henkilo={this.props.henkilo} oidHenkilo={this.props.oidHenkilo} />
                ],
            ];
        };

        // Basic info default buttons
        this._readOnlyButtons = (edit) => {
            const duplicate = this.props.henkilo.henkilo.duplicate;
            const passivoitu = this.props.henkilo.henkilo.passivoitu;
            return [
                <EditButton editAction={edit} L={this.L} disabled={duplicate | passivoitu} />,
                <YksiloiHetutonButton henkilo={this.props.henkilo} disabled={duplicate | passivoitu} L={this.L} yksiloiAction={this.props.yksiloiHenkilo} />,
                <PassivoiButton henkilo={this.props.henkilo} disabled={duplicate | passivoitu} L={this.L} passivoiAction={this.props.passivoiHenkilo} />,
            ];
        }
    }
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
    yksiloiHenkilo, updateAndRefetchKayttajatieto, updateHenkiloNavigation, fetchHenkiloSlaves, unlinkHenkilo})(OppijaViewContainer);
