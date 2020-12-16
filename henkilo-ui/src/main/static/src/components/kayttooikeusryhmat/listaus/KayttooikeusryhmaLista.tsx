import * as React from 'react';
import './KayttooikeusryhmaLista.css';
import KayttooikeusryhmaTiedot from './KayttooikeusryhmaTiedot';
import * as R from 'ramda';
import { Locale } from '../../../types/locale.type';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import LocalizedTextGroup from '../../common/LocalizedTextGroup';
import { Text } from '../../../types/domain/kayttooikeus/text.types';
import { Localisations } from '../../../types/localisation.type';
import { localizeTextGroup } from '../../../utilities/localisation.util';

type Props = {
    muokkausoikeus: boolean;
    items: Array<Kayttooikeusryhma>;
    labelPath: Array<string>;
    locale: Locale;
    L: Localisations;
    router: any;
    filter: string;
    naytaVainPalvelulleSallitut: boolean;
    naytaPassivoidut: boolean;
};

type State = {
    showItems: Array<boolean>;
};

export default class KayttooikeusryhmaLista extends React.Component<Props, State> {
    state = {
        showItems: [],
    };

    componentDidMount() {
        this.setState({
            showItems: this.props.items.map((item: any) => false),
        });
    }

    render() {
        return (
            <div className="kayttooikeuryhma-lista">
                {this.props.items // Näytetäänkö vain palvelukäyttäjille vai virkailijoille
                    .filter(this.naytaSallitutFilter)
                    .filter(this.naytaPassivoidutFilter) // filter by given string
                    .filter(this.nimiFilter) // sort alphabetically
                    .sort(this.nimiSort) // map käyttöoikeus to html
                    .map((item: Kayttooikeusryhma, index: number) => {
                        const texts: any = R.path(['nimi', 'texts'], item);
                        return (
                            <div key={item.id} className="kayttooikeuryhma-lista-item">
                                <div
                                    className="kayttooikeusryhma-tiedot-header"
                                    onClick={() => {
                                        this._onToggle(index);
                                    }}
                                >
                                    <span>
                                        <LocalizedTextGroup locale={this.props.locale} texts={texts} />{' '}
                                        {this.getStatusString(item)}
                                    </span>
                                </div>
                                <KayttooikeusryhmaTiedot
                                    {...this.props}
                                    show={this.state.showItems[index]}
                                    item={item}
                                />
                            </div>
                        );
                    })}
            </div>
        );
    }

    _onToggle = (index: number): void => {
        this.setState({
            showItems: R.update(index, !this.state.showItems[index], this.state.showItems),
        });
    };

    naytaSallitutFilter = (kayttooikeusryhma: Kayttooikeusryhma) => {
        return this.props.naytaVainPalvelulleSallitut
            ? kayttooikeusryhma.sallittuKayttajatyyppi === 'PALVELU'
            : kayttooikeusryhma.sallittuKayttajatyyppi === null ||
                  kayttooikeusryhma.sallittuKayttajatyyppi === 'VIRKAILIJA';
    };

    naytaPassivoidutFilter = (kayttooikeusryhma: Kayttooikeusryhma) => {
        return !kayttooikeusryhma.passivoitu || this.props.naytaPassivoidut;
    };

    nimiFilter = (item: Kayttooikeusryhma) => {
        if (this.props.filter.length === 0) {
            return true;
        }
        const nimi: Text | null | undefined = R.find((text: Text) => text.lang === this.props.locale.toUpperCase())(
            R.path(['nimi', 'texts'], item) || []
        );
        const text: string = nimi ? nimi.text : '';
        return text.toLowerCase().indexOf(this.props.filter.toLowerCase()) >= 0;
    };

    nimiSort = (a: Kayttooikeusryhma, b: Kayttooikeusryhma) => {
        const nameA = (localizeTextGroup(R.path(['nimi', 'texts'], a) || [], this.props.locale) || '').toLowerCase();
        const nameB = (localizeTextGroup(R.path(['nimi', 'texts'], b) || [], this.props.locale) || '').toLowerCase();
        if (nameA < nameB) {
            return -1;
        }
        if (nameB < nameA) {
            return 1;
        }
        return 0;
    };

    getStatusString = (kayttooikeusryhma: Kayttooikeusryhma) => {
        return kayttooikeusryhma.passivoitu ? ` (${this.props.L['KAYTTOOIKEUSRYHMAT_PASSIVOITU']})` : '';
    };
}
