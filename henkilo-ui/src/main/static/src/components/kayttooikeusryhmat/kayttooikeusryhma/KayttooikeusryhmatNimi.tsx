import React from 'react';
import type { LocalizableField } from './KayttooikeusryhmaPage';
import './KayttooikeusryhmatNimi.css';
import { useLocalisations } from '../../../selectors';

type Props = {
    name: LocalizableField;
    setName: (arg0: string, arg1: string) => void;
};

const KayttooikeusryhmatNimi = (props: Props) => {
    const { L } = useLocalisations();
    return (
        <div className="kayttooikeusryhmat-nimi">
            <h4>{L('KAYTTOOIKEUSRYHMAT_LISAA_NIMI')}</h4>
            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-fi">
                    FI
                </label>
                <input
                    id="kayttooikeusryhma-nimi-fi"
                    className="oph-input"
                    type="text"
                    value={props.name.FI}
                    onChange={(event) => props.setName('FI', event.target.value)}
                />
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-sv">
                    SV
                </label>
                <input
                    id="kayttooikeusryhma-nimi-sv"
                    className="oph-input"
                    type="text"
                    value={props.name.SV}
                    onChange={(event) => props.setName('SV', event.target.value)}
                />
            </div>

            <div className="oph-field oph-field-inline oph-field-is-required">
                <label className="oph-label oph-bold oph-label-short" htmlFor="kayttooikeusryhma-nimi-en">
                    EN
                </label>
                <input
                    id="kayttooikeusryhma-nimi-en"
                    className="oph-input"
                    type="text"
                    value={props.name.EN}
                    onChange={(event) => props.setName('EN', event.target.value)}
                />
            </div>
        </div>
    );
};

export default KayttooikeusryhmatNimi;
