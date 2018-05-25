// @flow
import React from 'react'
import type {Node} from 'react';
import { Link } from 'react-router'
import type { L } from '../../types/localisation.type'
import type { PalvelukayttajaRead } from '../../types/domain/kayttooikeus/palvelukayttaja.types'
import type { PalvelukayttajatState } from '../../reducers/palvelukayttaja.reducer'
import './PalvelukayttajaHakuTaulukko.css'
import Loader from '../common/icons/Loader'

type Props = {
    L: L,
    palvelukayttajat: PalvelukayttajatState,
}

class PalvelukayttajaHakuTaulukko extends React.Component<Props> {

    render() {
        return (
            <table className="PalvelukayttajaHakuTaulukko">
                <thead>
                    <tr>
                        <th>{this.props.L['HENKILO_PALVELUN_NIMI']}</th>
                        <th>{this.props.L['HENKILO_KAYTTAJANIMI']}</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.palvelukayttajat.loading ? this.renderLoader() : this.renderData()}
                </tbody>
            </table>)
    }

    renderData = () => {
        return this.props.palvelukayttajat.data.length ? this.renderRivit(this.props.palvelukayttajat.data) : this.renderKokoRivi(this.props.L['HENKILOHAKU_EI_TULOKSIA'])
    }

    renderRivit(palvelukayttajat: Array<PalvelukayttajaRead>): Array<Node> {
        return palvelukayttajat.map(this.renderRivi)
    }

    renderRivi(palvelukayttaja: PalvelukayttajaRead): Node {
        return (
            <tr key={palvelukayttaja.oid}>
                <td>
                    <Link to={`/virkailija/${palvelukayttaja.oid}`}>
                        {palvelukayttaja.nimi}
                    </Link>
                </td>
                <td>
                    {palvelukayttaja.kayttajatunnus}
                </td>
            </tr>
        )
    }

    renderLoader() {
        return this.renderKokoRivi(<Loader />)
    }

    renderKokoRivi(sisalto: any) {
        return <tr><td colSpan="2">{sisalto}</td></tr>
    }

}

export default PalvelukayttajaHakuTaulukko
