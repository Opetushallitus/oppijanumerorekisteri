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
import type {HenkiloDuplicate} from '../../types/domain/oppijanumerorekisteri/HenkiloDuplicate'
import Notifications from '../../components/common/notifications/Notifications'
import type {Notification, NotificationType} from '../../components/common/notifications/Notifications'
import PropertySingleton from '../../globals/PropertySingleton'
import type {L} from "../../types/localisation.type";
import OppijaCreateDuplikaatit from './OppijaCreateDuplikaatit'
import {updateDefaultNavigation} from "../../actions/navigation.actions";

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
    updateDefaultNavigation: () => void
}

type State = {
    ilmoitukset: Array<Notification>,
    oppija: HenkiloCreate,
    naytaDuplikaatit: boolean,
    duplikaatit: Array<HenkiloDuplicate>,
}

/**
 * Oppijan luonti -näkymä.
 */
class OppijaCreateContainer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {ilmoitukset: [], oppija: {}, naytaDuplikaatit: false, duplikaatit: []}
    }

    componentDidMount() {
        this.props.updateDefaultNavigation();

        this.props.fetchSukupuoliKoodisto();
        this.props.fetchKieliKoodisto();
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
                {this.state.naytaDuplikaatit === false &&
                <OppijaCreateForm
                    tallenna={this.tallenna}
                    locale={this.props.locale}
                    L={this.props.L}
                    sukupuoliKoodisto={this.props.sukupuoliKoodisto}
                    kieliKoodisto={this.props.kieliKoodisto}
                    kansalaisuusKoodisto={this.props.kansalaisuusKoodisto}
                    />
                }
                {this.state.naytaDuplikaatit === true &&
                <OppijaCreateDuplikaatit
                    locale={this.props.locale}
                    L={this.props.L}
                    tallenna={this.luoOppijaJaNavigoi}
                    peruuta={this.peruuta}
                    oppija={this.state.oppija}
                    duplikaatit={this.state.duplikaatit}
                    />
                }
            </div>
        )
    }

    lisaaIlmoitus = (type: NotificationType, messageKey: string) => {
        const ilmoitus = {id: '' + PropertySingleton.getNewId(), type: type, notL10nMessage: messageKey};
        this.setState({ilmoitukset: [...this.state.ilmoitukset, ilmoitus]})
    };

    poistaIlmoitus = (type: NotificationType, id: ?string) => {
        const ilmoitukset = this.state.ilmoitukset.filter(ilmoitus => ilmoitus.id !== id);
        this.setState({ilmoitukset: ilmoitukset})
    };

    tallenna = async (oppija: HenkiloCreate) => {
        try {
            // tarkistetaan ennen luontia duplikaatit
            const duplikaatit = await this.haeDuplikaatit(oppija);
            if (duplikaatit.length > 0) {
                this.setState({oppija: oppija, naytaDuplikaatit: true, duplikaatit: duplikaatit})
            } else {
                // luodaan oppija
                this.luoOppijaJaNavigoi(oppija)
            }
        } catch (error) {
            this.lisaaIlmoitus('error', 'HENKILON_LUONTI_EPAONNISTUI');
            throw error
        }
    };

    luoOppijaJaNavigoi = async (oppija: HenkiloCreate): Promise<void> => {
        const oid = await this.luoOppija(oppija);
        this.props.router.push(`/oppija/${oid}`)
    };

    peruuta = () => {
        window.location.reload()
    };

    haeDuplikaatit = async (oppija: HenkiloCreate): Promise<Array<HenkiloDuplicate>> => {
        const url = urls.url('oppijanumerorekisteri-service.henkilo.duplikaatit', oppija.etunimet, oppija.kutsumanimi, oppija.sukunimi);
        return await http.get(url)
    };

    luoOppija = async (oppija: HenkiloCreate): Promise<string> => {
        const url = urls.url('oppijanumerorekisteri-service.oppija');
        return await http.post(url, oppija) // palauttaa oid
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
};

export default connect(mapStateToProps, {
    fetchKieliKoodisto,
    fetchSukupuoliKoodisto,
    fetchKansalaisuusKoodisto,
    updateDefaultNavigation,
})(OppijaCreateContainer)
