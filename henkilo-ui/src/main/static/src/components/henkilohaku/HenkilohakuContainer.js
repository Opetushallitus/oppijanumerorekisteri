// @flow

import React from 'react'
import HenkilohakuPage from "./HenkilohakuPage";
import {connect} from 'react-redux';
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import Loader from "../common/icons/Loader";
import {fetchAllKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import {clearHenkilohaku, henkilohaku, updateFilters} from "../../actions/henkilohaku.actions";
import {fetchAllRyhmas} from "../../actions/organisaatio.actions";
import {removeNotification} from "../../actions/notifications.actions";
import type {Locale} from "../../types/locale.type";
import type {L10n} from "../../types/localisation.type";
import type {Henkilo} from "../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {HenkilohakuCriteria} from "../../types/domain/kayttooikeus/HenkilohakuCriteria.types";
import type {HenkilohakuState} from "../../reducers/henkilohaku.reducer";

type Props = {
    l10n: L10n,
    locale: Locale,
    fetchOmattiedotOrganisaatios: () => void,
    fetchAllKayttooikeusryhma: () => void,
    fetchAllRyhmas: () => void,
    henkilohaku: () => void,
    henkilo: Henkilo,
    henkilohakuState: HenkilohakuState,
    updateFilters: (HenkilohakuCriteria) => void,
    notifications: Array<any>,
    removeNotification: (string, string, string) => void,
    clearHenkilohaku: () => void,
    isAdmin: boolean
}

class HenkilohakuContainer extends React.Component<Props,> {

    initialCriteria: HenkilohakuCriteria = {
        noOrganisation: false,
        subOrganisation: true,
        passivoitu: false,
        dublicates: false,
    };

    componentWillMount() {
        this.props.fetchOmattiedotOrganisaatios();
        this.props.fetchAllKayttooikeusryhma();
        this.props.fetchAllRyhmas();
    }

    render() {
        return !this.props.allKayttooikeusryhmasLoading
            ? <HenkilohakuPage l10n={this.props.l10n}
                               locale={this.props.locale}
                               initialCriteria={this.initialCriteria}
                               henkilo={this.props.henkilo}
                               henkilohakuAction={this.props.henkilohaku}
                               henkilohakuResult={this.props.henkilohakuState.result}
                               henkiloHakuFilters={this.props.henkilohakuState.filters}
                               updateFilters={this.props.updateFilters}
                               henkilohakuLoading={this.props.henkilohakuState.henkilohakuLoading}
                               notifications={this.props.notifications}
                               removeNotification={this.props.removeNotification}
                               clearHenkilohaku={this.props.clearHenkilohaku}
                               isAdmin={this.props.isAdmin}/>
            : <Loader />
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: state.henkilo,
        allKayttooikeusryhmasLoading: state.kayttooikeus.allKayttooikeusryhmasLoading,
        henkilohakuState: state.henkilohakuState,
        notifications: state.notifications.henkilohakuNotifications,
        isAdmin: state.omattiedot.isAdmin,
        ryhmas: state.ryhmatState
    };
};


export default connect(mapStateToProps, {fetchOmattiedotOrganisaatios, fetchAllKayttooikeusryhma,
    henkilohaku, updateFilters, removeNotification, clearHenkilohaku, fetchAllRyhmas})(HenkilohakuContainer);
