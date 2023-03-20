import React from 'react';
import classNames from 'classnames';
import { Locale } from '../../../types/locale.type';
import { Kayttooikeusryhma } from '../../../types/domain/kayttooikeus/kayttooikeusryhma.types';
import './KayttooikeusryhmaSelect.css';
import { toLocalizedText } from '../../../localizabletext';
import { SallitutKayttajatyypit } from '../../kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPage';

type KielistettyKayttooikeusryhma = {
    id: number;
    nimi: string;
    kuvaus: string;
};

type Props = {
    locale: Locale;
    L: {
        [key: string]: string;
    };
    kayttooikeusryhmat: Array<Kayttooikeusryhma>;
    onSelect: (kayttooikeusryhma: Kayttooikeusryhma) => void;
    sallittuKayttajatyyppi: SallitutKayttajatyypit | null | undefined;
};

type State = {
    kaikki: Array<KielistettyKayttooikeusryhma>;
    naytettavat: Array<KielistettyKayttooikeusryhma>;
    valittu: KielistettyKayttooikeusryhma | null | undefined;
    hakutermi: string;
};

/**
 * Käyttöoikeusryhmän valintakomponentti.
 *
 * Ensisijaisesti tarkoitettu anomuksien luontiin, jossa halutaan näyttää käyttöoikeusryhmän nimen lisäksi kuvaus.
 */
class KayttooikeusryhmaSelect extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        const sallitut = this.filterEiSallitutKayttooikeusryhmat(
            props.kayttooikeusryhmat,
            props.sallittuKayttajatyyppi
        );
        const kaikki = this.getKielistetyt(sallitut);
        this.state = {
            kaikki: kaikki,
            naytettavat: kaikki,
            valittu: null,
            hakutermi: '',
        };
    }

    componentWillReceiveProps(props: Props) {
        const sallitut = this.filterEiSallitutKayttooikeusryhmat(
            props.kayttooikeusryhmat,
            props.sallittuKayttajatyyppi
        );
        const kaikki = this.getKielistetyt(sallitut);
        const naytettavat = this.getNaytettavat(kaikki, this.state.hakutermi);
        this.setState({ kaikki: kaikki, naytettavat: naytettavat });
    }

    filterEiSallitutKayttooikeusryhmat = (
        kayttooikeusryhmat: Array<Kayttooikeusryhma>,
        sallittuKayttajatyyppi: SallitutKayttajatyypit | null | undefined
    ): Array<Kayttooikeusryhma> =>
        kayttooikeusryhmat.filter(
            (kayttooikeusRyhma) =>
                !kayttooikeusRyhma.sallittuKayttajatyyppi ||
                kayttooikeusRyhma.sallittuKayttajatyyppi === sallittuKayttajatyyppi
        );
    getKielistetyt = (kayttooikeusryhmat: Array<Kayttooikeusryhma>): Array<KielistettyKayttooikeusryhma> => {
        return kayttooikeusryhmat.map(this.getKielistetty).sort((a, b) => a.nimi.localeCompare(b.nimi));
    };

    getKielistetty = (kayttooikeusryhma: Kayttooikeusryhma): KielistettyKayttooikeusryhma => {
        const locale = this.props.locale;
        return {
            id: kayttooikeusryhma.id,
            nimi: toLocalizedText(locale, kayttooikeusryhma.nimi, ''),
            kuvaus: toLocalizedText(locale, kayttooikeusryhma.kuvaus, ''),
        };
    };

    getNaytettavat = (
        kayttooikeusryhmat: Array<KielistettyKayttooikeusryhma>,
        hakutermi: string
    ): Array<KielistettyKayttooikeusryhma> => {
        return kayttooikeusryhmat.filter((kayttooikeusryhma) => {
            return kayttooikeusryhma.nimi.toLowerCase().indexOf(hakutermi.toLowerCase()) !== -1;
        });
    };

    render() {
        const invalid = !this.state.valittu;
        return (
            <div className="flex-horizontal KayttooikeusryhmaSelect">
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
                    <button
                        type="button"
                        className="oph-button oph-button-primary lisaa"
                        onClick={this.onSubmit}
                        disabled={invalid}
                    >
                        {this.props.L['OMATTIEDOT_LISAA_HAETTAVIIN_KAYTTOOIKEUSRYHMIIN']}
                    </button>
                </div>
            </div>
        );
    }

    renderKayttooikeusryhmat = (kayttooikeusryhmat: Array<KielistettyKayttooikeusryhma>) => {
        if (kayttooikeusryhmat.length === 0) {
            return <div className="valittavat-tyhja"></div>;
        }
        return <div className="valittavat">{kayttooikeusryhmat.map(this.renderKayttooikeusryhma)}</div>;
    };

    renderKayttooikeusryhma = (kayttooikeusryhma: KielistettyKayttooikeusryhma) => {
        return (
            <div
                key={kayttooikeusryhma.id}
                className={classNames({
                    valittu: this.state.valittu === kayttooikeusryhma,
                    valittava: true,
                })}
                onClick={(event) => this.onSelect(event, kayttooikeusryhma)}
            >
                {kayttooikeusryhma.nimi}
            </div>
        );
    };

    renderValittuKayttooikeusryhma = (kayttooikeusryhma?: KielistettyKayttooikeusryhma) =>
        kayttooikeusryhma && (
            <div>
                <div className="oph-bold">{kayttooikeusryhma.nimi}</div>
                <div>{kayttooikeusryhma.kuvaus}</div>
            </div>
        );

    onFilter = (event: React.SyntheticEvent<HTMLInputElement>) => {
        const hakutermi = event.currentTarget.value;
        const naytettavat = this.getNaytettavat(this.state.kaikki, hakutermi);
        const valittuId = this.state.valittu ? this.state.valittu.id : null;
        const valittu = valittuId ? naytettavat.find((naytettava) => naytettava.id === valittuId) : null;
        this.setState({
            naytettavat: naytettavat,
            hakutermi: hakutermi,
            valittu: valittu,
        });
    };

    onSelect = (event: React.SyntheticEvent, valittu: KielistettyKayttooikeusryhma) => {
        event.preventDefault();
        this.setState({ valittu: valittu });
    };

    onSubmit = (event: React.SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const valittuId = this.state.valittu ? this.state.valittu.id : null;
        const sallitut = this.filterEiSallitutKayttooikeusryhmat(
            this.props.kayttooikeusryhmat,
            this.props.sallittuKayttajatyyppi
        );
        const valittu = sallitut.find((kayttooikeusryhma) => kayttooikeusryhma.id === valittuId);
        if (valittu) {
            this.props.onSelect(valittu);
            this.setState({ valittu: null });
        }
    };
}

export default KayttooikeusryhmaSelect;
