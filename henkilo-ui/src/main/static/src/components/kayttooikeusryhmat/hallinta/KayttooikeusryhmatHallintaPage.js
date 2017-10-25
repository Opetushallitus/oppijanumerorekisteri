// @flow
import React from 'react';
import KayttooikeusryhmaLista from "./KayttooikeusryhmaLista";
import type {Locale} from "../../../types/locale.type";
import type {Kayttooikeusryhma} from "../../../types/kayttooikeusryhma.type";


type Props = {
    kayttooikeusryhmat: Array<Kayttooikeusryhma>,
    locale: Locale,
    L: any
}

export default class KayttooikeusryhmatHallintaPage extends React.Component<Props> {

    render() {
        return <div className="kayttooikeusryhmat-hallinta">
            <KayttooikeusryhmaLista {...this.props}
                            items={this.props.kayttooikeusryhmat}
                            labelPath={['name']}></KayttooikeusryhmaLista>
        </div>
    }

}