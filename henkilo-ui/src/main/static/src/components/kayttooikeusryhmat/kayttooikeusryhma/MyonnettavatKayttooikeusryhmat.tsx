import React from 'react';
import './MyonnettavatKayttooikeusryhmat.css';
import { Locale } from '../../../types/locale.type';
import * as R from 'ramda';
import OphSelect from '../../common/select/OphSelect';
import type { Option, Options } from 'react-select';
import ItemList from './ItemList';
import { Localisations } from '../../../types/localisation.type';

type Props = {
    kayttooikeus: any;
    L: Localisations;
    locale: Locale;
    kayttooikeusryhmaSelectAction: (selection: Option<string>) => void;
    kayttooikeusryhmaSelections: Options<string>;
    removeKayttooikeusryhmaSelectAction: (selection: Option<string>) => void;
};

type State = {
    kayttooikeusryhmaOptions: Array<any>;
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
                const textObject = R.find(R.propEq('lang', lang))(
                    R.path(['description', 'texts'], kayttooikeusryhma) || []
                );
                return {
                    label: R.path(['text'], textObject),
                    value: kayttooikeusryhma.id,
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
