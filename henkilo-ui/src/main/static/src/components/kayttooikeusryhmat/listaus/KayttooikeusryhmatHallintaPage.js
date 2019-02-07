// @flow
import React from 'react';
import KayttooikeusryhmaLista from "./KayttooikeusryhmaLista";
import type {Locale} from "../../../types/locale.type";
import type {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";
import KayttooikeusryhmaListaSuodatin from "./KayttooikeusryhmaListaSuodatin";
import type {Localisations} from "../../../types/localisation.type";


type Props = {
    muokkausoikeus: boolean,
    kayttooikeusryhmat: Array<Kayttooikeusryhma>,
    locale: Locale,
    L: Localisations,
    router: any
}

type State = {
    filter: string,
    naytaVainPalvelulleSallitut: boolean,
}

export default class KayttooikeusryhmatHallintaPage extends React.Component<Props, State> {

    state = {
        filter: '',
        naytaVainPalvelulleSallitut: false,
    };

    render() {
        return <div className="kayttooikeusryhmat-hallinta">
            <h2 className="oph-h2 oph-bold">{this.props.L['KAYTTOOIKEUSRYHMAT_OTSIKKO_LISTA']}</h2>
            <KayttooikeusryhmaListaSuodatin onFilterEvent={this._onFilterChange} {...this.props}
                                            naytaVainPalvelulleSallitut={this.state.naytaVainPalvelulleSallitut}
                                            setNaytaVainSallitut={() => this.setState({naytaVainPalvelulleSallitut: !this.state.naytaVainPalvelulleSallitut,})}
            />
            <KayttooikeusryhmaLista {...this.props}
                                    items={this.props.kayttooikeusryhmat}
                                    filter={this.state.filter}
                                    naytaVainPalvelulleSallitut={this.state.naytaVainPalvelulleSallitut}
                                    labelPath={['name']}/>
        </div>
    }

    _onFilterChange = (event: SyntheticInputEvent<HTMLInputElement>): void => {
        this.setState({filter: event.target.value});
    }

}