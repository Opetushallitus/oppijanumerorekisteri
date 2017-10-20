// @flow
import React from 'react'
import classNames from 'classnames'
import type {Locale} from '../../../types/locale.type'
import type {Kayttooikeusryhma} from '../../../types/kayttooikeusryhma.type'
import './KayttooikeusryhmaSelect.css'
import {toLocalizedText} from '../../../localizabletext'

type KielistettyKayttooikeusryhma = {
    id: number,
    nimi: string,
    kuvaus: string,
}

type Props = {
    locale: Locale,
    L: any,
    kayttooikeusryhmat: Array<Kayttooikeusryhma>,
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void,
}

type State = {
    kaikki: Array<KielistettyKayttooikeusryhma>,
    naytettavat: Array<KielistettyKayttooikeusryhma>,
    valittu: ?KielistettyKayttooikeusryhma,
    hakutermi: string,
}

/**
 * Käyttöoikeusryhmän valintakomponentti.
 *
 * Ensisijaisesti tarkoitettu anomuksien luontiin, jossa halutaan näyttää käyttöoikeusryhmän nimen lisäksi kuvaus.
 */
class KayttooikeusryhmaSelect extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        const kaikki = this.getKielistetyt(props.kayttooikeusryhmat)
        this.state = {kaikki: kaikki, naytettavat: kaikki, valittu: null, hakutermi: ''}
    }

    componentWillReceiveProps(props: Props) {
        const kaikki = this.getKielistetyt(props.kayttooikeusryhmat)
        const naytettavat = this.getNaytettavat(kaikki, this.state.hakutermi)
        this.setState({kaikki: kaikki, naytettavat: naytettavat})
    }

    getKielistetyt = (kayttooikeusryhmat: Array<Kayttooikeusryhma>): Array<KielistettyKayttooikeusryhma> => {
        return kayttooikeusryhmat
            .map(this.getKielistetty)
            .sort((a, b) => a.nimi.localeCompare(b.nimi))
    }

    getKielistetty = (kayttooikeusryhma: Kayttooikeusryhma): KielistettyKayttooikeusryhma => {
        const locale = this.props.locale.toUpperCase()
        return {
            id: kayttooikeusryhma.id,
            nimi: toLocalizedText(locale, kayttooikeusryhma.nimi, ''),
            kuvaus: toLocalizedText(locale, kayttooikeusryhma.kuvaus, ''),
        }
    }

    getNaytettavat = (kayttooikeusryhmat: Array<KielistettyKayttooikeusryhma>, hakutermi: string): Array<KielistettyKayttooikeusryhma> => {
        return kayttooikeusryhmat.filter(kayttooikeusryhma => {
            return kayttooikeusryhma.nimi.toLowerCase().indexOf(hakutermi.toLowerCase()) !== -1
        })
    }

    render() {
        const invalid = !this.state.valittu
        return (
            <form onSubmit={this.onSubmit} className="flex-horizontal KayttooikeusryhmaSelect">
                <div className="flex-1 flex-same-size">
                    <input
                        className="oph-input"
                        placeholder={this.props.L['OMATTIEDOT_RAJAA_LISTAUSTA']}
                        type="text"
                        value={this.state.hakutermi}
                        onChange={this.onFilter}
                        />
                    {this.renderKayttooikeusryhmat(this.state.naytettavat)}
                </div>
                <div className="flex-1 flex-same-size valinta">
                    {this.renderValittuKayttooikeusryhma(this.state.valittu)}
                    <button type="submit"
                            className="oph-button oph-button-primary lisaa"
                            disabled={invalid}>
                        {this.props.L['OMATTIEDOT_LISAA_HAETTAVIIN_KAYTTOOIKEUSRYHMIIN']}
                    </button>
                </div>
            </form>
        )
    }

    renderKayttooikeusryhmat = (kayttooikeusryhmat: Array<KielistettyKayttooikeusryhma>) => {
        if (kayttooikeusryhmat.length === 0) {
            return <div className="valittavat-tyhja"></div>
        }
        return <div className="valittavat">{kayttooikeusryhmat.map(this.renderKayttooikeusryhma)}</div>
    }

    renderKayttooikeusryhma = (kayttooikeusryhma: KielistettyKayttooikeusryhma) => {
        return (
            <div key={kayttooikeusryhma.id}
                 className={classNames({valittu: this.state.valittu === kayttooikeusryhma, valittava: true})}
                 onClick={(event => this.onSelect(event, kayttooikeusryhma))}>
                 {kayttooikeusryhma.nimi}
            </div>
        )
    }

    renderValittuKayttooikeusryhma = (kayttooikeusryhma: ?KielistettyKayttooikeusryhma) => {
        if (kayttooikeusryhma) {
            return (
                <div>
                    <div className="oph-bold">{kayttooikeusryhma.nimi}</div>
                    <div>{kayttooikeusryhma.kuvaus}</div>
                </div>
            )
        }
    }

    onFilter = (event: SyntheticEvent<HTMLInputElement>) => {
        const hakutermi = event.currentTarget.value
        const naytettavat = this.getNaytettavat(this.state.kaikki, hakutermi)
        const valittuId = this.state.valittu ? this.state.valittu.id : null
        const valittu = valittuId ? naytettavat.find(naytettava => naytettava.id === valittuId) : null
        this.setState({naytettavat: naytettavat, hakutermi: hakutermi, valittu: valittu})
    }

    onSelect = (event: SyntheticEvent<>, valittu: KielistettyKayttooikeusryhma) => {
        event.preventDefault()
        this.setState({valittu: valittu})
    }

    onSubmit = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault()
        const valittuId = this.state.valittu ? this.state.valittu.id : null
        const valittu = this.props.kayttooikeusryhmat.find(kayttooikeusryhma => kayttooikeusryhma.id === valittuId)
        if (valittu) {
            this.props.onSelect(valittu)
            this.setState({valittu: null})
        }
    }

}

export default KayttooikeusryhmaSelect
