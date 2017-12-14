// @flow
import React from 'react';
import './KayttooikeusryhmaListaSuodatin.css';
import type {L} from "../../../types/localisation.type";
import { Link } from 'react-router';

type Props = {
    L: L,
    onFilterEvent: (event: SyntheticInputEvent<HTMLInputElement>) => void,
    router: any
}

export default class KayttooikeusryhmaListaSuodatin extends React.Component<Props> {

    render() {
        return <div className="kayttoikeusryhma-lista-suodatin">
            <div className="oph-field">
                <div className="oph-input-container flex-horizontal">
                    <input type="text" onChange={this.props.onFilterEvent} placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']} className="oph-input flex-item-1" />
                    <Link className="oph-button oph-button-primary lisaa-kayttooikeusryhma-button" to={'/kayttooikeusryhmat/lisaa'}>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA']}</Link>
                </div>
            </div>
        </div>
    }

}