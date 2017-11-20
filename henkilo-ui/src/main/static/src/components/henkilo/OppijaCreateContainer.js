// @flow
import React from 'react'
import {connect} from 'react-redux'
import {http} from '../../http'
import {urls} from 'oph-urls-js'
import {
    fetchKieliKoodisto,
    fetchSukupuoliKoodisto,
    fetchKansalaisuusKoodisto,
} from '../../actions/koodisto.actions'
import type {Locale} from '../../types/locale.type'
import type {Koodisto} from '../../types/domain/koodisto/koodisto.types'
import OppijaCreateForm from './OppijaCreateForm'
import type {HenkiloCreate} from '../../types/domain/oppijanumerorekisteri/henkilo.types'
import Notifications from '../../components/common/notifications/Notifications'
import type {Notification, NotificationType} from '../../components/common/notifications/Notifications'
import PropertySingleton from '../../globals/PropertySingleton'
import type {L} from "../../types/localisation.type";

type Props = {
    router: any,
    locale: Locale,
    L: L,
    fetchSukupuoliKoodisto: () => void,
    sukupuoliKoodisto: Koodisto,
    fetchKieliKoodisto: () => void,
    kieliKoodisto: Koodisto,
    fetchKansalaisuusKoodisto: () => void,
    kansalaisuusKoodisto: Koodisto,
}

type State = {
    ilmoitukset: Array<Notification>,
}

/**
 * Oppijan luonti -näkymä.
 */
class OppijaCreateContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.state = {ilmoitukset: []}
    }

    componentDidMount() {
        this.props.fetchSukupuoliKoodisto()
        this.props.fetchKieliKoodisto()
        this.props.fetchKansalaisuusKoodisto()
    }

    render() {
        return (
            <div className="wrapper">
                <Notifications
                    notifications={this.state.ilmoitukset}
                    L={this.props.L}
                    closeAction={this.poistaIlmoitus}
                    />
                <h1>{this.props.L['OPPIJAN_LUONTI_OTSIKKO']}</h1>
                <OppijaCreateForm
                    tallenna={this.tallenna}
                    locale={this.props.locale}
                    L={this.props.L}
                    sukupuoliKoodisto={this.props.sukupuoliKoodisto}
                    kieliKoodisto={this.props.kieliKoodisto}
                    kansalaisuusKoodisto={this.props.kansalaisuusKoodisto}
                    />
            </div>
        )
    }

    lisaaIlmoitus = (type: NotificationType, messageKey: string) => {
        const ilmoitus = {id: '' + PropertySingleton.getNewId(), type: type, notL10nMessage: messageKey}
        this.setState({ilmoitukset: [...this.state.ilmoitukset, ilmoitus]})
    }

    poistaIlmoitus = (type: NotificationType, id: ?string) => {
        const ilmoitukset = this.state.ilmoitukset.filter(ilmoitus => ilmoitus.id !== id)
        this.setState({ilmoitukset: ilmoitukset})
    }

    tallenna = async (oppija: HenkiloCreate) => {
        try {
            const url = urls.url('oppijanumerorekisteri-service.oppija')
            const oid = await http.post(url, oppija)
            this.props.router.push(`/oppija/${oid}`)
        } catch (error) {
            this.lisaaIlmoitus('error', this.props.L['HENKILON_LUONTI_EPAONNISTUI'])
        }
    }

}

const mapStateToProps = (state) => {
    return {
        locale: state.locale,
        L: state.l10n.localisations[state.locale],
        sukupuoliKoodisto: state.koodisto.sukupuoliKoodisto,
        kieliKoodisto: state.koodisto.kieliKoodisto,
        kansalaisuusKoodisto: state.koodisto.kansalaisuusKoodisto,
    }
}

export default connect(mapStateToProps, {
    fetchKieliKoodisto,
    fetchSukupuoliKoodisto,
    fetchKansalaisuusKoodisto,
})(OppijaCreateContainer)
