import './KayttooikeusryhmatSallittuKayttajatyyppi.css';
import React from 'react';

import { SallitutKayttajatyypit } from './KayttooikeusryhmaPage';
import { useLocalisations } from '../../../selectors';

type OwnProps = {
    kayttajaTyyppi: SallitutKayttajatyypit | null;
    setSallittuKayttajatyyppi: () => void;
};

const KayttooikeusryhmatSallittuKayttajatyyppi = ({ kayttajaTyyppi, setSallittuKayttajatyyppi }: OwnProps) => {
    const { L } = useLocalisations();
    return (
        <div className="kayttooikeusryhmat-sallittu-kayttajatyyppi-wrapper">
            <span className="oph-h4 oph-bold">{L('KAYTTOOIKEUSRYHMAT_KAYTTAJATYYPPI_OTSIKKO')}</span>
            <label className="oph-checkable oph-field-is-required" htmlFor="kayttooikeusryhmaKayttajatyyppi">
                <input
                    id="kayttooikeusryhmaKayttajatyyppi"
                    className="oph-checkable-input"
                    type="checkbox"
                    onChange={setSallittuKayttajatyyppi}
                    checked={kayttajaTyyppi === 'PALVELU'}
                />
                <span className="oph-checkable-text">{L('KAYTTOOIKEUSRYHMAT_KAYTTAJATYYPPI_VAIN_PALVELU')}</span>
            </label>
        </div>
    );
};

export default KayttooikeusryhmatSallittuKayttajatyyppi;
