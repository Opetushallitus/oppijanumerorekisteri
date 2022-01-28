import React from 'react';
import './KayttooikeusryhmatPalvelutJaKayttooikeudet.css';
import OphSelect from '../../common/select/OphSelect';
import type { Option, Options } from 'react-select';
import { Locale } from '../../../types/locale.type';
import { PalvelutState } from '../../../reducers/palvelut.reducer';
import * as R from 'ramda';
import { KayttooikeusState } from '../../../reducers/kayttooikeus.reducer';
import { PalveluKayttooikeus } from '../../../types/domain/kayttooikeus/palvelukayttooikeus.types';
import { PalveluJaKayttooikeusSelection } from './KayttooikeusryhmaPage';
import PalveluJaKayttooikeusSelections from './PalveluJaKayttooikeusSelections';
import { Localisations } from '../../../types/localisation.type';
import { Text } from '../../../types/domain/kayttooikeus/text.types';

type Props = {
    L: Localisations;
    locale: Locale;
    palvelutState: PalvelutState;
    kayttooikeusState: KayttooikeusState;
    palvelutSelectAction: (selection: Option<string>) => void;
    palvelutSelection: Option<string>;
    palveluKayttooikeusSelectAction: (selection: Option<string>) => void;
    palveluKayttooikeusSelection: Option<string>;
    lisaaPalveluJaKayttooikeusAction: () => void;
    palveluJaKayttooikeusSelections: Array<PalveluJaKayttooikeusSelection>;
    removePalveluJaKayttooikeus: (arg0: PalveluJaKayttooikeusSelection) => void;
};

type State = {
    palvelutOptions: Options<string>;
    palveluKayttooikeusOptions: Options<string>;
};

export default class KayttooikeusryhmatPalvelutJaKayttooikeudet extends React.Component<Props, State> {
    state = {
        palvelutOptions: [],
        palveluKayttooikeusOptions: [],
    };

    componentWillMount() {
        const lang = this.props.locale.toUpperCase();
        const palvelutOptions: Array<any> = this.props.palvelutState.palvelut.map((palvelu) => {
            const textObject = R.find(R.propEq('lang', lang))(palvelu.description.texts);
            return {
                label: R.path(['text'], textObject),
                value: palvelu.name,
            };
        });
        this.setState({ palvelutOptions });
    }

    componentWillReceiveProps(nextProps: Props) {
        const lang = this.props.locale.toUpperCase();
        const palveluKayttooikeusOptions: Array<any> = nextProps.kayttooikeusState.palveluKayttooikeus.map(
            (palveluKayttooikeus: PalveluKayttooikeus) => {
                const textObject: Text | null | undefined = R.find(R.propEq('lang', lang))(
                    palveluKayttooikeus.oikeusLangs
                );
                return {
                    label: R.path(['text'], textObject),
                    value: palveluKayttooikeus.rooli,
                };
            }
        );
        this.setState({ palveluKayttooikeusOptions });
    }

    render() {
        return (
            <div className="kayttooikeusryhmat-palvelu-ja-kayttooikeudet">
                <h4>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_PALVELUT_JA_OIKEUDET']} *</h4>
                <div className="flex-horizontal">
                    <div className="flex-item-1">
                        <OphSelect
                            id="kayttooikeusryhmat-palvelut"
                            options={this.state.palvelutOptions}
                            value={this.props.palvelutSelection?.value}
                            placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_PALVELU']}
                            onChange={this.props.palvelutSelectAction}
                        ></OphSelect>
                    </div>

                    <div className="flex-item-1 kayttooikeudet-wrapper">
                        <div className="flex-inline">
                            <div className="flex-item-1">
                                <OphSelect
                                    id="kayttooikeusryhmat-palvelu-kayttooikeudet"
                                    options={this.state.palveluKayttooikeusOptions}
                                    disabled={!this.props.palvelutSelection}
                                    value={this.props.palveluKayttooikeusSelection?.value}
                                    placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_LISAA_VALITSE_KAYTTOOIKEUS']}
                                    onChange={this.props.palveluKayttooikeusSelectAction}
                                ></OphSelect>
                            </div>
                            <button
                                className="oph-button add-button oph-button-primary"
                                disabled={
                                    this.props.palvelutSelection === undefined ||
                                    this.props.palveluKayttooikeusSelection === undefined
                                }
                                onClick={() => this.props.lisaaPalveluJaKayttooikeusAction()}
                            >
                                {this.props.L['LISAA']}
                            </button>
                        </div>
                    </div>
                </div>
                <PalveluJaKayttooikeusSelections
                    items={this.props.palveluJaKayttooikeusSelections}
                    removeAction={this.props.removePalveluJaKayttooikeus}
                    L={this.props.L}
                ></PalveluJaKayttooikeusSelections>
            </div>
        );
    }
}
