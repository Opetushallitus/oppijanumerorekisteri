// @flow
import React from 'react'
import {urls} from 'oph-urls-js'
import {http} from '../../../http'
import OphModal from '../../common/modal/OphModal'
import DuplikaatitTable from './DuplikaatitTable'
import type {L} from "../../../types/l.type";

type Props = {
    L: L,
    etunimet: ?string,
    kutsumanimi: ?string,
    sukunimi: ?string,
    lisaaOppijaKayttajanOrganisaatioihin: (henkiloOid: string) => Promise<*>,
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
                    <OphModal onClose={this.onClose} big={true}>
                        <DuplikaatitTable
                            L={this.props.L}
                            data={this.state.data}
                            lisaaOppijaKayttajanOrganisaatioihin={this.lisaaOppijaKayttajanOrganisaatioihin}
                            />
                    </OphModal>
                }
            </div>
        )
    }

    fetchDuplikaatit = async (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault()
        this.setState({loading: true, loaded: false})
        const url = urls.url('oppijanumerorekisteri-service.henkilo.duplikaatit', this.props.etunimet, this.props.kutsumanimi, this.props.sukunimi)
        try {
            const henkilot = await http.get(url)
            const visible = henkilot.length > 0
            this.setState({loading: false, loaded: true, data: henkilot, visible: visible})
        } catch (e) {
            this.setState({loading: false})
        }
    }

    onClose = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault()
        this.setState({visible: false})
    }

    lisaaOppijaKayttajanOrganisaatioihin = async (henkiloOid: string) => {
        this.setState({visible: false})
        await this.props.lisaaOppijaKayttajanOrganisaatioihin(henkiloOid)
    }

}

export default DuplikaatitButton
