// @flow
import React from 'react';
import KayttooikeusryhmaLista from "./KayttooikeusryhmaLista";
import type {Locale} from "../../../types/locale.type";
import type {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";
import KayttooikeusryhmaListaSuodatin from "./KayttooikeusryhmaListaSuodatin";


type Props = {
    kayttooikeusryhmat: Array<Kayttooikeusryhma>,
    locale: Locale,
    L: any,
    router: any
}

type State = {
    filter: string
}

export default class KayttooikeusryhmatHallintaPage extends React.Component<Props, State> {

    state = {
        filter: ''
    };

    render() {
        return <div className="kayttooikeusryhmat-hallinta">
            <KayttooikeusryhmaListaSuodatin onFilterEvent={this._onFilterChange} {...this.props}></KayttooikeusryhmaListaSuodatin>
            <KayttooikeusryhmaLista {...this.props}
                            items={this.props.kayttooikeusryhmat}
                            filter={this.state.filter}
                            labelPath={['name']}></KayttooikeusryhmaLista>
        </div>
    }

    _onFilterChange = (event: SyntheticInputEvent<HTMLInputElement>): void => {
        this.setState({filter: event.target.value});
    }

}