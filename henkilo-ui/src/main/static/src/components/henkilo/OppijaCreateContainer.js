// @flow
import React from 'react'
import {connect} from 'react-redux'
import {http} from '../../http'
import {urls} from 'oph-urls-js'
import {
    fetchKieliKoodisto,
    fetchSukupuoliKoodisto,
    fetchKansalaisuusKoodisto,
} from '../../actions/koodisto.actions';
import type {Locale} from '../../types/locale.type'
import type {Koodisto} from '../../types/koodisto.type'
import OppijaCreateForm from './OppijaCreateForm'
import type {HenkiloCreate} from '../../types/henkilo.type'
import WideRedNotification from '../../components/common/notifications/WideRedNotification'

type Props = {
    router: any,
    locale: Locale,
    L: any,
    fetchSukupuoliKoodisto: () => void,
    sukupuoliKoodisto: Koodisto,
    fetchKieliKoodisto: () => void,
    kieliKoodisto: Koodisto,
    fetchKansalaisuusKoodisto: () => void,
    kansalaisuusKoodisto: Koodisto,
}

type State = {
    error?: string,
}

/**
 * Oppijan luonti -näkymä.
 */
class OppijaCreateContainer extends React.Component<Props, State> {

    componentDidMount() {
        this.props.fetchSukupuoliKoodisto()
        this.props.fetchKieliKoodisto()
        this.props.fetchKansalaisuusKoodisto()
    }

    render() {
        return (
            <div className="wrapper">
                {this.state && this.state.error
                    ? <WideRedNotification message={this.state.error} closeAction={() => this.setError()} />
                    : null
                }
                <h1>{this.props.L['OPPIJAN_LUONTI_OTSIKKO']}</h1>
                <OppijaCreateForm
                    onSubmit={this.onSubmit}
                    locale={this.props.locale}
                    L={this.props.L}
                    sukupuoliKoodisto={this.props.sukupuoliKoodisto}
                    kieliKoodisto={this.props.kieliKoodisto}
                    kansalaisuusKoodisto={this.props.kansalaisuusKoodisto}
                    />
            </div>
        )
    }

    setError = (error) => {
        this.setState({error: error});
    }

    onSubmit = async (henkilo: HenkiloCreate) => {
        try {
            const henkiloOid = await this.createHenkilo(henkilo);
            this.navigateToHenkilo(henkiloOid);
        } catch (error) {
            this.setError(this.props.L['HENKILON_LUONTI_EPAONNISTUI']);
        }
    }

    createHenkilo = async (henkilo: HenkiloCreate) => {
        const henkiloUrl = urls.url('oppijanumerorekisteri-service.henkilo');
        return await http.post(henkiloUrl, henkilo);
    }

    navigateToHenkilo = (oid) => {
        this.props.router.push(`/oppija/${oid}`);
    }

}

const mapStateToProps = (state) => {
    return {
        locale: state.locale,
        L: state.l10n.localisations[state.locale],
        sukupuoliKoodisto: state.koodisto.sukupuoliKoodisto,
        kieliKoodisto: state.koodisto.kieliKoodisto,
        kansalaisuusKoodisto: state.koodisto.kansalaisuusKoodisto,
    };
};

export default connect(mapStateToProps, {
    fetchKieliKoodisto,
    fetchSukupuoliKoodisto,
    fetchKansalaisuusKoodisto,
})(OppijaCreateContainer);
