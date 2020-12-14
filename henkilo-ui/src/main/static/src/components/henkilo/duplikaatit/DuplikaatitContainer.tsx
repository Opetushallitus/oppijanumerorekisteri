import DuplikaatitPage from "./DuplikaatitPage"
import React from "react"
import {connect} from "react-redux"
import {
    fetchHenkilo,
    fetchKayttaja,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
} from "../../../actions/henkilo.actions"
import {fetchOmattiedot} from "../../../actions/omattiedot.actions"
import {
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
} from "../../../actions/koodisto.actions"
import {removeNotification} from "../../../actions/notifications.actions"
import {HenkiloState} from "../../../reducers/henkilo.reducer"
import {L10n} from "../../../types/localisation.type"
import {Locale} from "../../../types/locale.type"
import PropertySingleton from "../../../globals/PropertySingleton"
import {KoodistoState} from "../../../reducers/koodisto.reducer"

type OwnProps = {
    params: any
    location: any
    route: any
}

type Props = OwnProps & {
    l10n: L10n
    locale: Locale
    oidHenkilo: string
    henkilo: HenkiloState
    koodisto: KoodistoState
    henkiloType: string
    fetchHenkilo: (arg0: string) => void
    fetchKayttaja: (arg0: string) => void
    fetchOmattiedot: () => void
    fetchHenkiloMaster: (arg0: string) => void
    fetchHenkiloHakemukset: (arg0: string) => void
    fetchHenkiloDuplicates: (arg0: string) => void
    fetchMaatJaValtiotKoodisto: () => void
    fetchKansalaisuusKoodisto: () => void
    fetchKieliKoodisto: () => void
    externalPermissionService: string
}

class VirkailijaDuplikaatitContainer extends React.Component<Props> {
    async componentDidMount() {
        if (this.props.externalPermissionService) {
            PropertySingleton.setState({
                externalPermissionService: this.props.externalPermissionService,
            })
        }
        this.props.fetchHenkilo(this.props.oidHenkilo)
        this.props.fetchKayttaja(this.props.oidHenkilo)
        this.props.fetchOmattiedot()
        this.props.fetchKansalaisuusKoodisto()
        this.props.fetchMaatJaValtiotKoodisto()
        this.props.fetchKieliKoodisto()
        this.props.fetchHenkiloMaster(this.props.oidHenkilo)
        this.props.fetchHenkiloDuplicates(this.props.oidHenkilo)
        this.props.fetchHenkiloHakemukset(this.props.oidHenkilo)
    }

    render() {
        return <DuplikaatitPage {...this.props} />
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        oidHenkilo: ownProps.params["oid"],
        externalPermissionService:
            ownProps.location.query.permissionCheckService,
        henkiloType: ownProps.route["henkiloType"],
        l10n: state.l10n.localisations,
        locale: state.locale,
        henkilo: state.henkilo,
        koodisto: state.koodisto,
        notifications: state.notifications.duplicatesNotifications,
    }
}

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
    fetchHenkilo,
    fetchKayttaja,
    fetchOmattiedot,
    fetchHenkiloDuplicates,
    fetchHenkiloMaster,
    fetchHenkiloHakemukset,
    fetchKansalaisuusKoodisto,
    fetchMaatJaValtiotKoodisto,
    fetchKieliKoodisto,
    removeNotification,
})(VirkailijaDuplikaatitContainer)