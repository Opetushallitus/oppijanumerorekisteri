// @flow
import React from 'react';
import './KayttooikeusryhmaListaSuodatin.css';
import type {Localisations} from "../../../types/localisation.type";
import { Link } from 'react-router';
import BooleanRadioButtonGroup from '../../common/radiobuttongroup/BooleanRadioButtonGroup';

type Props = {
    L: Localisations,
    muokkausoikeus: boolean,
    onFilterEvent: (event: SyntheticInputEvent<HTMLInputElement>) => void,
    router: any,
    naytaVainPalvelulleSallitut: boolean,
    setNaytaVainSallitut: () => void,
}

export default class KayttooikeusryhmaListaSuodatin extends React.Component<Props> {

    render() {
        return <div className="kayttoikeusryhma-lista-suodatin">
            <div className="oph-field">
                <div className="oph-input-container flex-horizontal">
                    <input type="text" onChange={this.props.onFilterEvent} placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']} className="oph-input flex-item-1" />
                    <BooleanRadioButtonGroup value={this.props.naytaVainPalvelulleSallitut}
                                             onChange={this.props.setNaytaVainSallitut}
                                             trueLabel={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_PALVELU']}
                                             falseLabel={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_NAYTA_VIRKAILIJA']}
                    />
                    <Link className="oph-button oph-button-primary lisaa-kayttooikeusryhma-button" to={'/kayttooikeusryhmat/lisaa'} disabled={!this.props.muokkausoikeus}>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA']}</Link>
                </div>
            </div>
        </div>
    }

}