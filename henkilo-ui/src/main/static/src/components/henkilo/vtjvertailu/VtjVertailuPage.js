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
import {hasAnyPalveluRooli} from "../../../utilities/palvelurooli.util";
import type {HenkiloState} from "../../../reducers/henkilo.reducer";
import type {OmattiedotState} from "../../../reducers/omattiedot.reducer";
import type {L} from "../../../types/localisation.type";
import {NOTIFICATIONTYPES} from "../../common/Notification/notificationtypes";
import {addGlobalNotification} from "../../../actions/notification.actions";
import type {GlobalNotificationConfig} from "../../../types/notification.types";

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
    fetchHenkiloSlaves: (string) => void,
    addGlobalNotification: (payload: GlobalNotificationConfig) => void

}

class VtjVertailuPage extends React.Component<Props> {

    constructor() {
        super();
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
                <p class="oph-h2 oph-bold">{this.props.L['HENKILO_VTJ_VERTAILU']}</p>
                <VtjVertailuListaus henkilo={this.props.henkilo} L={this.props.L}/>
                <Button action={this.overrideHenkiloInformation.bind(this)}
                        disabled={this.isDisabled()}>
                    {this.props.L['HENKILO_VTJ_YLIAJA']}
                </Button>
            </div>;
    }

    async overrideHenkiloInformation(): Promise<any> {
        try {
            // await this.props.overrideYksiloimatonHenkiloVtjData(this.props.oidHenkilo);
            this.props.fetchHenkilo(this.props.oidHenkilo);
            this.props.addGlobalNotification({
                key: 'HENKILOVTJYLIAJOISUCCESS',
                title: this.props.L['HENKILO_VTJ_YLIAJA_SUCCESS'],
                type: NOTIFICATIONTYPES.SUCCESS,
                autoClose: 10000
            });
        } catch (error) {
            this.props.addGlobalNotification({
                key: 'HENKILOVTJYLIAJOIFAILURE',
                title: this.props.L['HENKILO_VTJ_YLIAJA_FAILURE'],
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000
            });
            throw error;
        }
    }

    isDisabled(): boolean {
        const hasAccess = hasAnyPalveluRooli(this.props.omattiedot.organisaatiot, ['HENKILONHALLINTA_OPHREKISTERI', 'OPPIJANUMEROREKISTERI_VTJ_VERTAILUNAKYMA']);
        const currentUserIsViewedHenkilo = this.props.oidHenkilo === this.props.ownOid;
        const isEnabledVtjVertailuView = enabledVtjVertailuView(this.props.henkilo.henkilo);
        return !isEnabledVtjVertailuView || currentUserIsViewedHenkilo || !hasAccess;
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
    fetchHenkiloSlaves,
    addGlobalNotification
})(VtjVertailuPage);