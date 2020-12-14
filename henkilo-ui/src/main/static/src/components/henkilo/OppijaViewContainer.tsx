import React from "react"
import {connect} from "react-redux"
import {
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchHenkiloYksilointitieto,
} from "../../actions/henkilo.actions"
import {
    fetchKansalaisuusKoodisto,
    fetchKieliKoodisto,
    fetchYhteystietotyypitKoodisto,
} from "../../actions/koodisto.actions"

import PropertySingleton from "../../globals/PropertySingleton"
import HenkiloViewPage from "./HenkiloViewPage"
import {HenkiloState} from "../../reducers/henkilo.reducer"
import {L10n} from "../../types/localisation.type"
import {Locale} from "../../types/locale.type"
import {KoodistoState} from "../../reducers/koodisto.reducer"
import {getEmptyKayttooikeusRyhmaState} from "../../reducers/kayttooikeusryhma.reducer"

type OwnProps = {
    oidHenkilo: string
    externalPermissionService?: string | null
    l10n: L10n
    locale: Locale
}

type Props = OwnProps & {
    henkilo: HenkiloState
    fetchHenkiloSlaves: (oid: string) => void
    fetchHenkilo: (oid: string) => void
    fetchYhteystietotyypitKoodisto: () => void
    fetchKieliKoodisto: () => void
    fetchKansalaisuusKoodisto: () => void
    fetchHenkiloYksilointitieto: (arg0: string) => void
    koodisto: KoodistoState
}

class OppijaViewContainer extends React.Component<Props> {
    async componentDidMount() {
        if (this.props.externalPermissionService) {
            PropertySingleton.setState({
                externalPermissionService: this.props.externalPermissionService,
            })
        }
        await this.fetchOppijaViewData(this.props.oidHenkilo)
    }

    async componentWillReceiveProps(nextProps: Props) {
        if (nextProps.oidHenkilo !== this.props.oidHenkilo) {
            await this.fetchOppijaViewData(nextProps.oidHenkilo)
        }
    }

    async fetchOppijaViewData(oid: string) {
        await this.props.fetchHenkilo(oid)
        this.props.fetchHenkiloYksilointitieto(oid)
        this.props.fetchHenkiloSlaves(oid)
        this.props.fetchYhteystietotyypitKoodisto()
        this.props.fetchKieliKoodisto()
        this.props.fetchKansalaisuusKoodisto()
    }

    render() {
        return (
            <HenkiloViewPage
                {...this.props}
                kayttooikeus={getEmptyKayttooikeusRyhmaState()}
                organisaatioCache={{}}
                view={"OPPIJA"}
            />
        )
    }
}

const mapStateToProps = state => {
    return {
        henkilo: state.henkilo,
        koodisto: state.koodisto,
    }
}

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps, {
    fetchHenkilo,
    fetchHenkiloSlaves,
    fetchYhteystietotyypitKoodisto,
    fetchHenkiloYksilointitieto,
    fetchKieliKoodisto,
    fetchKansalaisuusKoodisto,
})(OppijaViewContainer)