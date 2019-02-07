// @flow
import * as React from 'react';
import './KayttooikeusryhmaLista.css';
import KayttooikeusryhmaTiedot from './KayttooikeusryhmaTiedot';
import * as R from 'ramda';
import type {Locale} from "../../../types/locale.type";
import type {Kayttooikeusryhma} from "../../../types/domain/kayttooikeus/kayttooikeusryhma.types";
import LocalizedTextGroup from "../../common/LocalizedTextGroup";
import type {Text} from "../../../types/domain/kayttooikeus/text.types";
import type {Localisations} from "../../../types/localisation.type";
import {localizeTextGroup} from "../../../utilities/localisation.util";

type Props = {
    muokkausoikeus: boolean,
    items: Array<Kayttooikeusryhma>,
    labelPath: Array<string>,
    locale: Locale,
    L: Localisations,
    router: any,
    filter: string,
    naytaVainPalvelulleSallitut: boolean,
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
                    // Näytetäänkö vain palvelukäyttäjille vai virkailijoille
                    .filter(kayttooikeusryhma => {
                        return this.props.naytaVainPalvelulleSallitut
                            ? kayttooikeusryhma.sallittuKayttajatyyppi === 'PALVELU'
                            : kayttooikeusryhma.sallittuKayttajatyyppi === null || kayttooikeusryhma.sallittuKayttajatyyppi === 'VIRKAILIJA';
                    })
                    // filter by given string
                    .filter( (item: Kayttooikeusryhma) => {
                        if (this.props.filter.length === 0) {
                            return true;
                        }
                        const nimi: ?Text = R.find( (text: Text) => text.lang === this.props.locale.toUpperCase())(item.nimi.texts);
                        const text: string = nimi ? nimi.text : '';
                        return text.toLowerCase().indexOf(this.props.filter.toLowerCase()) >= 0;
                    })
                    // sort alphabetically
                    .sort( (a: Kayttooikeusryhma, b: Kayttooikeusryhma) => {
                        const nameA = (localizeTextGroup(a.nimi.texts, this.props.locale) || '').toLowerCase();
                        const nameB = (localizeTextGroup(b.nimi.texts, this.props.locale) || '').toLowerCase();
                        if(nameA < nameB) {
                            return -1;
                        }
                        if(nameB < nameA) { 
                            return 1;
                        }
                        return 0;
                    })
                    // map käyttöoikeus to html
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