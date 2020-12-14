import React from "react"
import KayttooikeusryhmaLista from "./KayttooikeusryhmaLista"
import {Locale} from "../../../types/locale.type"
import {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types"
import KayttooikeusryhmaListaSuodatin from "./KayttooikeusryhmaListaSuodatin"
import {Localisations} from "../../../types/localisation.type"
import {OmattiedotState} from "../../../reducers/omattiedot.reducer"

type Props = {
    muokkausoikeus: boolean
    kayttooikeusryhmat: Array<Kayttooikeusryhma>
    locale: Locale
    L: Localisations
    router: any
    omattiedot: OmattiedotState
}

type State = {
    filter: string
    naytaVainPalvelulleSallitut: boolean
    naytaPassivoidut: boolean
}

export default class KayttooikeusryhmatHallintaPage extends React.Component<
    Props,
    State
> {
    state = {
        filter: "",
        naytaVainPalvelulleSallitut: false,
        naytaPassivoidut: false,
    }

    render() {
        return (
            <div className="kayttooikeusryhmat-hallinta">
                <h2 className="oph-h2 oph-bold">
                    {this.props.L["KAYTTOOIKEUSRYHMAT_OTSIKKO_LISTA"]}
                </h2>
                <KayttooikeusryhmaListaSuodatin
                    onFilterEvent={this._onFilterChange}
                    {...this.props}
                    naytaVainPalvelulleSallitut={
                        this.state.naytaVainPalvelulleSallitut
                    }
                    setNaytaVainSallitut={() =>
                        this.setState({
                            naytaVainPalvelulleSallitut: !this.state
                                .naytaVainPalvelulleSallitut,
                        })
                    }
                    naytaPassivoidut={this.state.naytaPassivoidut}
                    toggleNaytaPassivoidut={() =>
                        this.setState({
                            naytaPassivoidut: !this.state.naytaPassivoidut,
                        })
                    }
                    isAdmin={this.props.omattiedot.isAdmin}
                />
                <KayttooikeusryhmaLista
                    {...this.props}
                    items={this.props.kayttooikeusryhmat}
                    filter={this.state.filter}
                    naytaVainPalvelulleSallitut={
                        this.state.naytaVainPalvelulleSallitut
                    }
                    naytaPassivoidut={this.state.naytaPassivoidut}
                    labelPath={["name"]}
                />
            </div>
        )
    }

    _onFilterChange = (event: React.SyntheticEvent<HTMLInputElement>): void => {
        this.setState({filter: event.target.value})
    }
}