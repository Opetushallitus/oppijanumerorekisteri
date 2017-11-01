// @flow
import React from 'react';
import './KayttooikeusryhmaListaSuodatin.css';

type Props = {
    L: any,
    onFilterEvent: (event: SyntheticInputEvent<HTMLInputElement>) => void,
    router: any
}

export default class KayttooikeusryhmaListaSuodatin extends React.Component<Props> {

    render() {
        return <div className="kayttoikeusryhma-lista-suodatin">
            <div className="oph-field">
                <div className="oph-input-container flex-horizontal">
                    <input type="text" onChange={this.props.onFilterEvent} placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']} className="oph-input flex-item-1" />
                    <button className="oph-button oph-button-primary lisaa-kayttooikeusryhma-button" onClick={() => {this.props.router.push('/kayttooikeusryhmat/lisaa')}}>{this.props.L['KAYTTOOIKEUSRYHMAT_LISAA']}</button>
                </div>
            </div>
        </div>
    }

}