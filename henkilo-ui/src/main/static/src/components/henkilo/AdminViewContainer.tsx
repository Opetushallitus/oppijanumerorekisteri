import React from "react"
import {connect} from "react-redux"
import {
    fetchKayttaja,
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKayttajatieto,
    fetchHenkiloSlaves,
    clearHenkilo,
    fetchHenkiloYksilointitieto,
} from "../../actions/henkilo.actions"
import {
    fetchKansalaisuusKoodisto,
    fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions"
import {
    fetchAllKayttooikeusAnomusForHenkilo,
    fetchAllKayttooikeusryhmasForHenkilo,
    updateHaettuKayttooikeusryhma,
} from "../../actions/kayttooikeusryhma.actions"
import {fetchOmattiedotOrganisaatios} from "../../actions/omattiedot.actions"
import HenkiloViewPage from "./HenkiloViewPage"
import {L10n} from "../../types/localisation.type"
import {Locale} from "../../types/locale.type"
import {HenkiloState} from "../../reducers/henkilo.reducer"
import {KoodistoState} from "../../reducers/koodisto.reducer"
import {OrganisaatioCache} from "../../reducers/organisaatio.reducer"
import {KayttooikeusRyhmaState} from "../../reducers/kayttooikeusryhma.reducer"

type OwnProps = {
    oidHenkilo: string // tarkasteltava
    ownOid: string // tarkastelija
    henkiloType: string
    router: any
    l10n: L10n
    locale: Locale
}

type Props = OwnProps & {
    clearHenkilo: () => void
    fetchHenkilo: (arg0: string) => void
    fetchHenkiloOrgs: (arg0: string) => void
    fetchHenkiloSlaves: (arg0: string) => void
    fetchKieliKoodisto: () => void
    fetchKansalaisuusKoodisto: () => void
    fetchKayttaja: (arg0: string) => void
    fetchKayttajatieto: (arg0: string) => void
    fetchYhteystietotyypitKoodisto: () => void
    fetchAllKayttooikeusryhmasForHenkilo: (arg0: string) => void
    fetchAllKayttooikeusAnomusForHenkilo: (arg0: string) => void
    fetchHenkiloYksilointitieto: (arg0: string) => void
    fetchOmattiedotOrganisaatios: () => any
    henkilo: HenkiloState
    kayttooikeus: KayttooikeusRyhmaState
    koodisto: KoodistoState
    organisaatioCache: OrganisaatioCache
}

class AdminViewContainer extends React.Component<Props> {
    async componentDidMount() {
        await this.fetchHenkiloViewData(this.props.oidHenkilo)
    }

    async componentWillReceiveProps(nextProps: Props) {
        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            await this.fetchHenkiloViewData(nextProps.oidHenkilo)
        }
    }

    async fetchHenkiloViewData(oid: string) {
        this.props.clearHenkilo()
        await this.props.fetchHenkilo(oid)
        this.props.fetchHenkiloOrgs(oid)
        this.props.fetchHenkiloSlaves(oid)
        this.props.fetchHenkiloYksilointitieto(oid)
        this.props.fetchKieliKoodisto()
        this.props.fetchKansalaisuusKoodisto()
        this.props.fetchKayttaja(oid)
        this.props.fetchKayttajatieto(oid)
        this.props.fetchYhteystietotyypitKoodisto()
        this.props.fetchAllKayttooikeusryhmasForHenkilo(oid)
        this.props.fetchAllKayttooikeusAnomusForHenkilo(oid)
        this.props.fetchOmattiedotOrganisaatios()
    }

    render() {
        return <HenkiloViewPage {...this.props} view="ADMIN" />
    }
}

const mapStateToProps = state => {
    return {
        henkilo: state.henkilo,
        koodisto: state.koodisto,
        kayttooikeus: state.kayttooikeus,
        organisaatioCache: state.organisaatio.cached,
        notifications: state.notifications,
    }
}

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloOrgs,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
    fetchYhteystietotyypitKoodisto,
    fetchKayttaja,
    fetchKayttajatieto,
    fetchHenkiloYksilointitieto,
    fetchAllKayttooikeusryhmasForHenkilo,
    fetchAllKayttooikeusAnomusForHenkilo,
    updateHaettuKayttooikeusryhma,
    fetchOmattiedotOrganisaatios,
    fetchHenkiloSlaves,
    clearHenkilo,
})(AdminViewContainer)