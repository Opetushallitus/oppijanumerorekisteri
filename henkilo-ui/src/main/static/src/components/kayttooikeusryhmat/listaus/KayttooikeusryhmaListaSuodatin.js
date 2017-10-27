// @flow
import React from 'react';
import './KayttooikeusryhmaListaSuodatin.css';

type Props = {
    L: any,
    onFilterEvent: (event: SyntheticInputEvent<HTMLInputElement>) => void
}

export default class KayttooikeusryhmaListaSuodatin extends React.Component<Props> {

    render() {
        return <div className="kayttoikeusryhma-lista-suodatin">
            <div className="oph-field">
                <div className="oph-input-container">
                    <input type="text" onChange={this.props.onFilterEvent} placeholder={this.props.L['KAYTTOOIKEUSRYHMAT_HALLINTA_SUODATA']} className="oph-input" />
                </div>
            </div>
        </div>
    }

}