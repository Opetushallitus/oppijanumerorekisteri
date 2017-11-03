// @flow
import * as React from 'react';
import './KayttooikeusryhmaLista.css';
import KayttooikeusryhmaTiedot from './KayttooikeusryhmaTiedot';
import R from 'ramda';
import type {Locale} from "../../../types/locale.type";
import type {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";
import LocalizedTextGroup from "./LocalizedTextGroup";
import type {Text} from "../../../types/domain/kayttooikeus/text.types";

type Props = {
    items: Array<Kayttooikeusryhma>,
    labelPath: Array<string>,
    locale: Locale,
    L: any,
    router: any,
    filter: string
}

type State = {
    showItems: Array<boolean>
}

export default class KayttooikeusryhmaLista extends React.Component<Props, State> {

    state = {
        showItems: []
    };

    componentDidMount() {
        this.setState({
            showItems: this.props.items.map( (item: any) => false)
        });
    }

    render() {
        return <div className="kayttooikeuryhma-lista">
            {
                this.props.items
                    .filter( (item: Kayttooikeusryhma) => {
                        if(this.props.filter.length === 0) {return true}
                        const nimi: any = R.find( (text: Text) => text.lang === this.props.locale.toUpperCase())(R.path(['nimi', 'texts'], item));
                        const text = R.path(['text'], nimi);
                        return text.toLowerCase().indexOf(this.props.filter.toLowerCase()) >= 0 ? true : false;
                    })
                    .map( (item: Kayttooikeusryhma, index: number) => {
                        const texts: any = R.path(['nimi', 'texts'], item);
                        return <div key={item.id} className="kayttooikeuryhma-lista-item">
                            <div className="kayttooikeusryhma-tiedot-header" onClick={() => { this._onToggle(index) }}>
                                <span><LocalizedTextGroup locale={this.props.locale} texts={texts}></LocalizedTextGroup></span>
                            </div>
                            <KayttooikeusryhmaTiedot {...this.props} show={this.state.showItems[index]} item={item}></KayttooikeusryhmaTiedot>
                        </div>
                })
            }
        </div>
    }

    _onToggle = (index: number): void => {
        this.setState({showItems: R.update(index, !this.state.showItems[index], this.state.showItems)});
    }

}