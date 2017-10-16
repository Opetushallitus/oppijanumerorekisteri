//@flow
import React from 'react'
import {connect} from 'react-redux'
import {http} from '../../http'
import {urls} from 'oph-urls-js'
import PalveluCreateForm from './PalveluCreateForm'
import type {HenkiloCreate} from '../../types/henkilo.type'
import WideRedNotification from '../../components/common/notifications/WideRedNotification'

type Props = {
    router: any,
    L: any,
}

type State = {
    error?: string,
}

/**
 * Palvelukäyttäjän luonti -näkymä.
 */
class PalveluCreateContainer extends React.Component<Props, State> {

    render() {
        return (
            <div className="wrapper">
                {this.state && this.state.error
                    ? <WideRedNotification message={this.state.error} closeAction={() => this.setError()} />
                    : null
                }
                <h1>{this.props.L['PALVELUKAYTTAJAN_LUONTI_OTSIKKO']}</h1>
                <PalveluCreateForm onSubmit={this.onSubmit}
                                   L={this.props.L}>
                </PalveluCreateForm>
            </div>
        )
    }

    setError = (error) => {
        this.setState({error: error});
    }

    onSubmit = async (henkilo : HenkiloCreate) => {
        try {
            const henkiloOid = await this.createHenkilo(henkilo);
            this.navigateToHenkilo(henkiloOid);
        } catch (error) {
            this.setError(this.props.L['HENKILON_LUONTI_EPAONNISTUI']);
        }
    }

    createHenkilo = async (henkilo : HenkiloCreate) => {
        const henkiloUrl = urls.url('oppijanumerorekisteri-service.henkilo');
        return await http.post(henkiloUrl, henkilo);
    }

    navigateToHenkilo = (oid) => {
        this.props.router.push(`/virkailija/${oid}`);
    }

};

const mapStateToProps = (state) => {
    return {
        L: state.l10n.localisations[state.locale],
    };
};

export default connect(mapStateToProps, {})(PalveluCreateContainer);
