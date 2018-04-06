// @flow

import React from 'react'
import HenkilohakuPage from "./HenkilohakuPage";
import {connect} from 'react-redux';
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import Loader from "../common/icons/Loader";
import {fetchAllKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import {clearHenkilohaku, henkilohaku, henkilohakuCount, updateFilters} from "../../actions/henkilohaku.actions";
import {fetchAllRyhmas} from "../../actions/organisaatio.actions";
import type {Locale} from "../../types/locale.type";
import type {L10n} from "../../types/localisation.type";
import type {Henkilo} from "../../types/domain/oppijanumerorekisteri/henkilo.types";
import type {
    HenkilohakuCriteria,
    HenkilohakuQueryparameters
} from "../../types/domain/kayttooikeus/HenkilohakuCriteria.types";
import type {HenkilohakuState} from "../../reducers/henkilohaku.reducer";
import type {OmattiedotState} from "../../reducers/omattiedot.reducer";

type Props = {
    l10n: L10n,
    locale: Locale,
    fetchOmattiedotOrganisaatios: () => void,
    fetchAllKayttooikeusryhma: () => void,
    allKayttooikeusryhmasLoading: boolean,
    fetchAllRyhmas: () => void,
    henkilohaku: (HenkilohakuCriteria, HenkilohakuQueryparameters) => void,
    henkilohakuCount: (HenkilohakuCriteria) => void,
    henkilo: Henkilo,
    henkilohakuState: HenkilohakuState,
    updateFilters: (HenkilohakuCriteria) => void,
    clearHenkilohaku: () => void,
    isAdmin: boolean,
    omattiedot: OmattiedotState
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
        return !this.props.allKayttooikeusryhmasLoading && !this.props.omattiedot.omattiedotLoading
            ? <HenkilohakuPage l10n={this.props.l10n}
                               locale={this.props.locale}
                               initialCriteria={this.initialCriteria}
                               henkilo={this.props.henkilo}
                               henkilohakuAction={this.props.henkilohaku}
                               henkilohakuCount={this.props.henkilohakuCount}
                               henkilohakuResult={this.props.henkilohakuState.result}
                               henkilohakuResultCount={this.props.henkilohakuState.resultCount}
                               henkiloHakuFilters={this.props.henkilohakuState.filters}
                               updateFilters={this.props.updateFilters}
                               henkilohakuLoading={this.props.henkilohakuState.henkilohakuLoading}
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
        isAdmin: state.omattiedot.isAdmin,
        ryhmas: state.ryhmatState,
        omattiedot: state.omattiedot
    };
};


export default connect(mapStateToProps, {fetchOmattiedotOrganisaatios, fetchAllKayttooikeusryhma,
    henkilohaku, updateFilters, clearHenkilohaku, fetchAllRyhmas, henkilohakuCount})(HenkilohakuContainer);
