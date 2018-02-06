// @flow

import React from 'react';
import {connect} from 'react-redux';
import {
    fetchHenkilo,
    fetchHenkiloYksilointitieto,
    fetchHenkiloSlaves,
    fetchHenkiloMaster,
    overrideYksiloimatonHenkiloVtjData
} from "../../../actions/henkilo.actions";
import {fetchOmattiedot} from "../../../actions/omattiedot.actions";
import VtjVertailuListaus from './VtjVertailuListaus';
import Loader from "../../common/icons/Loader";
import {updateHenkiloNavigation} from "../../../actions/navigation.actions";
import Button from "../../common/button/Button";
import {enabledVtjVertailuView, henkiloViewTabs} from "../../navigation/NavigationTabs";
import WideGreenNotification from "../../common/notifications/WideGreenNotification";
import WideRedNotification from "../../common/notifications/WideRedNotification";
import {parsePalveluRoolit} from "../../../utilities/organisaatio.util";
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import type {OmattiedotState} from "../../../reducers/omattiedot.reducer";
import type {L} from "../../../types/localisation.type";

type Props = {
    oidHenkilo: string,
    henkiloType: string,
    henkilo: HenkiloState,
    ownOid: string,
    omattiedot: OmattiedotState,
    L: L,
    fetchHenkilo: (string) => void,
    fetchHenkiloYksilointitieto: (string) => void ,
    fetchHenkiloMaster: (string) => void,
    fetchOmattiedot: () => void,
    updateHenkiloNavigation: (any) => void,
    overrideYksiloimatonHenkiloVtjData: (string) => void,
    fetchHenkiloSlaves: (string) => void

}

type State = {
    showSuccess: boolean,
    showError: boolean
}

class VtjVertailuPage extends React.Component<Props, State> {

    constructor() {
        super();
        this.state = {
            showSuccess: false,
            showError: false
        }
    }

    async componentDidMount() {
        this.props.fetchOmattiedot();
        this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloYksilointitieto(this.props.oidHenkilo);
        this.props.fetchHenkiloMaster(this.props.oidHenkilo);
        this.props.fetchHenkiloSlaves(this.props.oidHenkilo); // tabs need data about master to switch duplicates tab enabled
    }

    componentWillReceiveProps(nextProps) {
        const tabs = henkiloViewTabs(this.props.oidHenkilo, nextProps.henkilo, nextProps.henkiloType);
        this.props.updateHenkiloNavigation(tabs);
    }

    render() {
        return this.props.henkilo.yksilointitiedotLoading || this.props.henkilo.henkiloLoading || this.props.omattiedot.omattiedotLoading ? <Loader/> :
            <div className="wrapper">
                <h1>{this.props.L['HENKILO_VTJ_VERTAILU']}</h1>
                {this.state.showSuccess ? <WideGreenNotification message={this.props.L['HENKILO_VTJ_YLIAJA_SUCCESS']} closeAction={this.hideSuccess.bind(this)}/> : null }
                {this.state.showError ? <WideRedNotification message={this.props.L['HENKILO_VTJ_YLIAJA_FAILURE']} closeAction={this.hideError.bind(this)}/> : null}
                <VtjVertailuListaus henkilo={this.props.henkilo} L={this.props.L}/>
                <Button action={this.overrideHenkiloInformation.bind(this)}
                        disabled={this.isDisabled()}>
                    {this.props.L['HENKILO_VTJ_YLIAJA']}
                </Button>
            </div>;
    }

    async overrideHenkiloInformation(): Promise<any> {
        try {
            await this.props.overrideYksiloimatonHenkiloVtjData(this.props.oidHenkilo);
            this.showSuccess();
        } catch (error) {
            this.showError();
            throw error;
        }
    }

    isDisabled(): boolean {
        const isVtjRole = parsePalveluRoolit(this.props.omattiedot.organisaatiot).includes('OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA');
        const currentUserIsViewedHenkilo = this.props.oidHenkilo === this.props.ownOid;
        const isEnabledVtjVertailuView = enabledVtjVertailuView(this.props.henkilo.henkilo);
        return !isEnabledVtjVertailuView || currentUserIsViewedHenkilo || !isVtjRole;
    }

    showError(): void{
        this.setState({showError: true});
    }
    
    hideError(): void {
        this.setState({showError: false});
    }

    showSuccess(): void {
        this.setState({showSuccess: true});
    }

    hideSuccess(): void {
        this.setState({showSuccess: false});
    }

}



const mapStateToProps = (state, ownProps) => {
    return {
        oidHenkilo: ownProps.params['oid'],
        henkiloType: ownProps.params['henkiloType'],
        henkilo: state.henkilo,
        ownOid: state.omattiedot.data.oid,
        omattiedotLoading: state.omattiedot.omattiedotLoading,
        omattiedot: state.omattiedot,
        L: state.l10n.localisations[state.locale]
    }
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloYksilointitieto,
    fetchHenkiloMaster,
    fetchOmattiedot,
    updateHenkiloNavigation,
    overrideYksiloimatonHenkiloVtjData,
    fetchHenkiloSlaves
})(VtjVertailuPage);