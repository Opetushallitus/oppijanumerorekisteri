// @flow
import React from 'react'
import {urls} from 'oph-urls-js'
import {http} from '../../../http'
import OphModal from '../../common/modal/OphModal'
import DuplikaatitTable from './DuplikaatitTable'

type Props = {
    L: any,
    etunimet: ?string,
    kutsumanimi: ?string,
    sukunimi: ?string,
}

type State = {
    loading: boolean,
    loaded: boolean,
    data: Array<any>,
    visible: boolean,
}

class DuplikaatitButton extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.state = {loading: false, loaded: false, data: [], visible: false}
    }

    render() {
        return (
            <div>
                <button type="button"
                        className="oph-button oph-button-primary"
                        onClick={this.fetchDuplikaatit}
                        disabled={!this.props.etunimet || !this.props.kutsumanimi || !this.props.sukunimi}>
                    {this.state.loading &&
                    <span className="oph-spinner oph-spinner-in-button">
                        <span className="oph-bounce oph-bounce1" aria-hidden="true"></span>
                        <span className="oph-bounce oph-bounce2" aria-hidden="true"></span>
                        <span className="oph-bounce oph-bounce3" aria-hidden="true"></span>
                    </span>
                    }
                    {this.props.L['HAE_HENKILOT_NIMELLA']}
                </button>
                {this.state.loaded && this.state.data.length === 0 &&
                    <span>{this.props.L['NIMELLA_EI_LOYTYNYT']}</span>
                }
                {this.state.visible &&
                    <OphModal onClose={this.onClose}>
                        <DuplikaatitTable L={this.props.L} data={this.state.data} />
                    </OphModal>
                }
            </div>
        )
    }

    fetchDuplikaatit = async (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault()
        this.setState({loading: true, loaded: false})
        const url = urls.url('oppijanumerorekisteri-service.henkilo.duplikaatit', this.props.etunimet, this.props.kutsumanimi, this.props.sukunimi)
        const henkilot = await http.get(url)
        const visible = henkilot.length > 0
        this.setState({loading: false, loaded: true, data: henkilot, visible: visible})
    }

    onClose = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault()
        this.setState({visible: false})
    }

}

export default DuplikaatitButton
