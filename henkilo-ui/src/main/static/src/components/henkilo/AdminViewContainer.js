// @flow

import React from 'react'
import {connect} from 'react-redux';
import {
    fetchKayttaja,
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, fetchHenkiloSlaves, clearHenkilo
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {henkiloViewTabs} from "../navigation/NavigationTabs";
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
    updateHaettuKayttooikeusryhma,
} from "../../actions/kayttooikeusryhma.actions";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import HenkiloViewPage from "./HenkiloViewPage";
import type {Tab} from "../../types/tab.types";
import type {L10n} from "../../types/localisation.type";
import type {Locale} from "../../types/locale.type";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {Navigation} from "../../actions/navigation.actions";
import type {KayttooikeusState} from "../../reducers/kayttooikeus.reducer";
import type {KoodistoState} from "../../reducers/koodisto.reducer";
import type {OrganisaatioState} from "../../reducers/organisaatio.reducer";

type Props = {
    oidHenkilo: string, // tarkasteltava
    ownOid: string, // tarkastelija
    henkiloType: string,
    clearHenkilo: () => void,
    router: any,
    fetchHenkilo: (string) => void,
    fetchHenkiloOrgs: (string) => void,
    fetchHenkiloSlaves: (string) => void,
    fetchKieliKoodisto: () => void,
    fetchKansalaisuusKoodisto: () => void,
    fetchSukupuoliKoodisto: () => void,
    fetchKayttaja: (string) => void,
    fetchKayttajatieto: (string) => void,
    fetchYhteystietotyypitKoodisto: () => void,
    fetchAllKayttooikeusryhmasForHenkilo: (string) => void,
    fetchAllKayttooikeusAnomusForHenkilo: (string) => void,
    fetchOmattiedotOrganisaatios: () => any,
    updateHenkiloNavigation: (Array<Tab>) => Navigation,
    l10n: L10n,
    locale: Locale,
    henkilo: HenkiloState,
    kayttooikeus: KayttooikeusState,
    koodisto: KoodistoState,
    organisaatioCache: OrganisaatioState
}

class AdminViewContainer extends React.Component<Props> {
    async componentDidMount() {
        this.props.clearHenkilo();
        if (this.props.oidHenkilo === this.props.ownOid) {
            this.props.router.replace('/omattiedot');
        }

        await this.props.fetchHenkilo(this.props.oidHenkilo);
        this.props.fetchHenkiloOrgs(this.props.oidHenkilo);
        this.props.fetchHenkiloSlaves(this.props.oidHenkilo);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttaja(this.props.oidHenkilo);
        this.props.fetchKayttajatieto(this.props.oidHenkilo);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(this.props.oidHenkilo);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(this.props.oidHenkilo);
        this.props.fetchOmattiedotOrganisaatios();
    };

    componentWillReceiveProps(nextProps: Props) {
        const tabs = henkiloViewTabs(this.props.oidHenkilo, nextProps.henkilo, 'admin');
        this.props.updateHenkiloNavigation(tabs);
    }

    render() {
        return <HenkiloViewPage {...this.props} view="ADMIN" />;
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
        notifications: state.notifications,
        ownOid: state.omattiedot.data.oid,
        isAdmin: state.omattiedot.isAdmin,
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchSukupuoliKoodisto,
    fetchYhteystietotyypitKoodisto,
    fetchKayttaja,
    fetchKayttajatieto,
    updateHenkiloNavigation,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchOmattiedotOrganisaatios,
    fetchHenkiloSlaves,
    clearHenkilo})(AdminViewContainer);
