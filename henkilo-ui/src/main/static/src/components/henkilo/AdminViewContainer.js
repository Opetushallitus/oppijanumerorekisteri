// @flow

import React from 'react'
import {connect} from 'react-redux';
import {
    fetchKayttaja,
    fetchHenkilo, fetchHenkiloOrgs, fetchKayttajatieto, fetchHenkiloSlaves, clearHenkilo, fetchHenkiloYksilointitieto
} from "../../actions/henkilo.actions";
import {
    fetchKansalaisuusKoodisto, fetchKieliKoodisto, fetchSukupuoliKoodisto, fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions";
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
    updateHaettuKayttooikeusryhma,
} from "../../actions/kayttooikeusryhma.actions";
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions";
import HenkiloViewPage from "./HenkiloViewPage";
import type {L10n} from "../../types/localisation.type";
import type {Locale} from "../../types/locale.type";
import type {HenkiloState} from "../../reducers/henkilo.reducer";
import type {KayttooikeusState} from "../../reducers/kayttooikeus.reducer";
import type {KoodistoState} from "../../reducers/koodisto.reducer";
import type {OrganisaatioState} from "../../reducers/organisaatio.reducer";
import type {KayttooikeusRyhmaState} from "../../reducers/kayttooikeusryhma.reducer";

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
    fetchHenkiloYksilointitieto: (string) => void,
    fetchOmattiedotOrganisaatios: () => any,
    l10n: L10n,
    locale: Locale,
    henkilo: HenkiloState,
    kayttooikeus: KayttooikeusRyhmaState,
    koodisto: KoodistoState,
    organisaatioCache: OrganisaatioState,
}

class AdminViewContainer extends React.Component<Props> {
    async componentDidMount() {
        await this.fetchHenkiloViewData(this.props.oidHenkilo)
    };

    async componentWillReceiveProps(nextProps: Props) {
        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            await this.fetchHenkiloViewData(nextProps.oidHenkilo)
        }
    }

    async fetchHenkiloViewData(oid) {
        this.props.clearHenkilo();
        await this.props.fetchHenkilo(oid);
        this.props.fetchHenkiloOrgs(oid);
        this.props.fetchHenkiloSlaves(oid);
        this.props.fetchHenkiloYksilointitieto(oid);
        this.props.fetchKieliKoodisto();
        this.props.fetchKansalaisuusKoodisto();
        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKayttaja(oid);
        this.props.fetchKayttajatieto(oid);
        this.props.fetchYhteystietotyypitKoodisto();
        this.props.fetchAllKayttooikeusryhmasForHenkilo(oid);
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid);
        this.props.fetchOmattiedotOrganisaatios();
    }

    render() {
        return <HenkiloViewPage {...this.props} view="ADMIN" />;
    }

}

const mapStateToProps = (state) => {
    return {
        henkilo: state.henkilo,
        koodisto: state.koodisto,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
        notifications: state.notifications
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
    fetchHenkiloYksilointitieto,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchOmattiedotOrganisaatios,
    fetchHenkiloSlaves,
    clearHenkilo})(AdminViewContainer);
