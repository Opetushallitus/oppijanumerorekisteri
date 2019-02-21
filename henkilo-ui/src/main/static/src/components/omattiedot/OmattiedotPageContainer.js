// @flow
import React from 'react';
import {connect} from 'react-redux';
import { fetchOmattiedot } from '../../actions/omattiedot.actions';
import {
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, clearHenkilo,
} from "../../actions/henkilo.actions";
import {fetchAllKayttooikeusryhmasForHenkilo, fetchAllKayttooikeusAnomusForHenkilo, updateHaettuKayttooikeusryhma} from "../../actions/kayttooikeusryhma.actions";
import { fetchKieliKoodisto, fetchKansalaisuusKoodisto, fetchYhteystietotyypitKoodisto } from '../../actions/koodisto.actions';
import {
    fetchAllHierarchialOrganisaatios, fetchAllOrganisaatios,
    fetchAllRyhmas
} from '../../actions/organisaatio.actions';
import HenkiloViewPage from "../henkilo/HenkiloViewPage";
import type {OmattiedotState} from "../../reducers/omattiedot.reducer";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {L10n} from "../../types/localisation.type";
import type {KoodistoState} from "../../reducers/koodisto.reducer";
import type {Locale} from "../../types/locale.type";
import type {KayttooikeusRyhmaState} from "../../reducers/kayttooikeusryhma.reducer";
import type {OrganisaatioCache, OrganisaatioState} from "../../reducers/organisaatio.reducer";
import type {RyhmatState} from "../../reducers/ryhmat.reducer";
import type {OrganisaatioKayttooikeusryhmatState} from "../../reducers/organisaatiokayttooikeusryhmat.reducer";

type OmattiedotPageContainerProps = {
    path: string,
    omattiedot: OmattiedotState,
    henkilo: HenkiloState,
    l10n: L10n,
    koodisto: KoodistoState,
    locale: Locale,
    kayttooikeus: KayttooikeusRyhmaState,
    organisaatios: OrganisaatioState,
    ryhmas: RyhmatState,
    organisaatioCache: OrganisaatioCache,
    organisaatioKayttooikeusryhmat: OrganisaatioKayttooikeusryhmatState,
    notifications: any,
    fetchOmattiedot: () => void,
    fetchHenkilo: (string) => void,
    fetchHenkiloOrgs: (string) => void,
    fetchYhteystietotyypitKoodisto: () => void,
    fetchKieliKoodisto: () => void,
    fetchKansalaisuusKoodisto: () => void,
    fetchKayttajatieto: (string) => void,
    fetchAllKayttooikeusryhmasForHenkilo: () => void,
    fetchAllKayttooikeusAnomusForHenkilo: (string) => void,
    updateHaettuKayttooikeusryhma: () => void,
    fetchAllOrganisaatios: () => void,
    fetchAllRyhmas: () => void,
    fetchAllHierarchialOrganisaatios: () => void,
    clearHenkilo: () => void,
}

type OmattiedotPageContainerState = {

}

class OmattiedotPageContainer extends React.Component<OmattiedotPageContainerProps, OmattiedotPageContainerState> {

    async componentDidMount() {
        this.props.clearHenkilo();

        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchAllOrganisaatios();
        this.props.fetchAllRyhmas();
        this.props.fetchAllHierarchialOrganisaatios();
        await this.props.fetchOmattiedot();
        const userOid = this.props.omattiedot.data.oid;
        this.props.fetchHenkilo(userOid);
        this.props.fetchKayttajatieto(userOid);
        this.props.fetchHenkiloOrgs(userOid);
        this.props.fetchAllKayttooikeusryhmasForHenkilo(); // For current user
        this.props.fetchAllKayttooikeusAnomusForHenkilo(userOid);
    }

    render() {
        return <HenkiloViewPage {...this.props} oidHenkilo={this.props.omattiedot.data.oid} view="OMATTIEDOT" />;
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname,
        omattiedot: state.omattiedot,
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        organisaatios: state.organisaatio,
        ryhmas: state.ryhmatState,
        organisaatioCache: state.organisaatio.cached,
        organisaatioKayttooikeusryhmat: state.OrganisaatioKayttooikeusryhmat,
        notifications: state.notifications,
    };
};

export default connect(mapStateToProps, {
    fetchOmattiedot,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchYhteystietotyypitKoodisto,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchKayttajatieto,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchAllOrganisaatios,
    fetchAllRyhmas,
    fetchAllHierarchialOrganisaatios,
    clearHenkilo,
})(OmattiedotPageContainer)
