// @flow

import React from 'react'
import {connect} from 'react-redux';
import HenkiloViewPage from "../../components/henkilo/HenkiloViewPage";
import {
    fetchKayttaja,
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, clearHenkilo, fetchHenkiloSlaves, fetchHenkiloYksilointitieto
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {updateHenkiloNavigation} from "../../actions/navigation.actions";
import {henkiloViewTabs} from "../navigation/NavigationTabs";
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo, getGrantablePrivileges,
    updateHaettuKayttooikeusryhma,
} from "../../actions/kayttooikeusryhma.actions";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import type {Navigation} from "../../actions/navigation.actions";
import type {Tab} from "../../types/tab.types";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {OrganisaatioCache} from "../../reducers/organisaatio.reducer";
import type {KoodistoState} from "../../reducers/koodisto.reducer";
import type {L10n} from "../../types/localisation.type";
import type {Locale} from "../../types/locale.type";
import type {KayttooikeusState} from "../../reducers/kayttooikeus.reducer";

type Props = {
    oidHenkilo: string,
    clearHenkilo: () => void,
    updateHenkiloNavigation: (Array<Tab>) => Navigation,
    henkilo: HenkiloState,
    organisaatioCache: OrganisaatioCache,
    koodisto: KoodistoState,
    l10n: L10n,
    locale: Locale,
    fetchHenkilo: (string) => void,
    fetchHenkiloOrgs: (string) => void,
    fetchHenkiloSlaves: (string) => void,
    fetchKieliKoodisto: () => void,
    fetchKansalaisuusKoodisto: () => void,
    fetchSukupuoliKoodisto: () => void,
    fetchKayttaja: (string) => void,
    fetchKayttajatieto: (string) => void,
    fetchYhteystietotyypitKoodisto: ()  => void,
    fetchAllKayttooikeusryhmasForHenkilo: (string) => void,
    fetchAllKayttooikeusAnomusForHenkilo: (string) => void,
    fetchHenkiloYksilointitieto: (string) => void,
    fetchOmattiedotOrganisaatios: () => any,
    getGrantablePrivileges: (string) => void,
    kayttooikeus: KayttooikeusState
}

class VirkailijaViewContainer extends React.Component<Props> {
    async componentDidMount() {
        this.props.clearHenkilo();
        const tabs = henkiloViewTabs(this.props.oidHenkilo, this.props.henkilo, 'virkailija');
        this.props.updateHenkiloNavigation(tabs);

        await this.fetchVirkailijaViewData(this.props.oidHenkilo)
    };


    async componentWillReceiveProps(nextProps: Props) {
        const tabs = henkiloViewTabs(this.props.oidHenkilo, nextProps.henkilo, 'virkailija');
        this.props.updateHenkiloNavigation(tabs);

        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            await this.fetchVirkailijaViewData(nextProps.oidHenkilo)
        }
    }

    async fetchVirkailijaViewData(oid) {
        await this.props.fetchHenkilo(oid);
        this.props.fetchHenkiloOrgs(oid);
        this.props.fetchHenkiloSlaves(oid);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttaja(oid);
        this.props.fetchKayttajatieto(oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(oid);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid);
        this.props.fetchOmattiedotOrganisaatios();
        this.props.getGrantablePrivileges(oid);
    }

    render() {
        return <HenkiloViewPage {...this.props} view="VIRKAILIJA" />;
    };

}

const mapStateToProps = (state) => {
    return {
        henkilo: state.henkilo,
        l10n: state.l10n.localisations,
        koodisto: state.koodisto,
        locale: state.locale,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
        notifications: state.notifications
    };
};

export default connect(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchHenkiloOrgs,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchSukupuoliKoodisto,
    fetchYhteystietotyypitKoodisto,
    fetchKayttaja,
    fetchKayttajatieto,
    updateHenkiloNavigation,
    fetchHenkiloYksilointitieto,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchOmattiedotOrganisaatios,
    getGrantablePrivileges,
    clearHenkilo})(VirkailijaViewContainer);
