import React from 'react';
import './MyonnettavatKayttooikeusryhmat.css';
import { Locale } from '../../../types/locale.type';
import OphSelect from '../../common/select/OphSelect';
import type { Option, Options } from 'react-select';
import ItemList from './ItemList';
import { Localisations } from '../../../types/localisation.type';
import { KayttooikeusRyhmaState } from '../../../reducers/kayttooikeusryhma.reducer';

type Props = {
    kayttooikeus: KayttooikeusRyhmaState;
    L: Localisations;
    locale: Locale;
    kayttooikeusryhmaSelectAction: (selection: Option<string>) => void;
    kayttooikeusryhmaSelections: Options<string>;
    removeKayttooikeusryhmaSelectAction: (selection: Option<string>) => void;
};

type State = {
    kayttooikeusryhmaOptions: Options<string>;
};

export default class MyonnettavatKayttooikeusryhmat extends React.Component<Props, State> {
    state = {
        kayttooikeusryhmaOptions: [],
    };

    componentWillMount() {
        const lang = this.props.locale.toUpperCase();
        const kayttooikeusryhmaOptions: Options<string> = this.props.kayttooikeus.allKayttooikeusryhmas
            .filter((kayttooikeusryhma) => !kayttooikeusryhma.passivoitu)
            .map((kayttooikeusryhma) => {
                const textObject = kayttooikeusryhma?.description?.texts?.find((t) => t.lang === lang);
                return {
                    label: textObject?.text,
                    value: kayttooikeusryhma.id?.toString(),
                };
            });
        this.setState({ kayttooikeusryhmaOptions });
    }

    render() {
        return (
            <div className="myonnettavat-kayttooikeusryhmat">
                <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_MITA_SAA_MYONTAA']}</h4>
                <div className="flex-horizontal">
                    <div className="flex-item-1">
                        <OphSelect
                            id="kayttooikeusryhma-myontooikeudet"
                            options={this.state.kayttooikeusryhmaOptions}
                            placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUSRYHMA']}
                            onChange={this.props.kayttooikeusryhmaSelectAction}
                        />
                        <ItemList
                            items={this.props.kayttooikeusryhmaSelections}
                            labelPath={['label']}
                            removeAction={this.props.removeKayttooikeusryhmaSelectAction}
                        />
                    </div>
                    <div className="flex-item-1"></div>
                </div>
            </div>
        );
    }
}
