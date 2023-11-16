import React from 'react';
import { Link } from 'react-router';

import './KayttooikeusryhmaListaSuodatin.css';
import { Localisations } from '../../../types/localisation.type';
import BooleanRadioButtonGroup from '../../common/radiobuttongroup/BooleanRadioButtonGroup';

type Props = {
    L: Localisations;
    muokkausoikeus: boolean;
    onFilterEvent: (event: React.ChangeEvent<HTMLInputElement>) => void;
    naytaVainPalvelulleSallitut: boolean;
    setNaytaVainSallitut: () => void;
    naytaPassivoidut: boolean;
    toggleNaytaPassivoidut: () => void;
    isAdmin: boolean;
};

export default class KayttooikeusryhmaListaSuodatin extends React.Component<Props> {
    render() {
        return (
            <div className="kayttoikeusryhma-lista-suodatin">
                <div className="oph-field">
                    <div className="oph-input-container flex-horizontal">
                        <input
                            type="text"
                            onChange={this.props.onFilterEvent}
                            placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']}
                            className="oph-input flex-item-1"
                        />
                        <BooleanRadioButtonGroup
                            value={this.props.naytaVainPalvelulleSallitut}
                            onChange={this.props.setNaytaVainSallitut}
                            trueLabel={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PALVELU']}
                            falseLabel={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_VIRKAILIJA']}
                        />
                        <Link
                            className="oph-button oph-button-primary lisaa-kayttooikeusryhma-button"
                            to={'/kayttooikeusryhmat/lisaa'}
                            disabled={!this.props.muokkausoikeus}
                        >
                            {this.props.L['KAYTTOOIKEUSRYHMAT_LISAA']}
                        </Link>
                    </div>
                    {this.props.isAdmin && (
                        <div className="oph-input-container flex-horizontal">
                            <div className="flex-inline">
                                <label className="oph-checkable" htmlFor="kayttooikeusryhmaNaytaPassivoidut">
                                    <input
                                        id="kayttooikeusryhmaNaytaPassivoidut"
                                        type="checkbox"
                                        className="oph-checkable-input"
                                        onChange={this.props.toggleNaytaPassivoidut}
                                        checked={this.props.naytaPassivoidut}
                                    />
                                    <span className="oph-checkable-text">
                                        {' '}
                                        {this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PASSIVOIDUT']}
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
