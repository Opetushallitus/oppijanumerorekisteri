// @flow
import './KayttooikeusryhmatSallittuKayttajatyyppi.css';
import React from 'react';
import {connect} from 'react-redux'
import type {SallitutKayttajatyypit} from "./KayttooikeusryhmaPage";
import type {Localisations} from "../../../types/localisation.type";

type KayttooikeusryhmatSallittuKayttajatyyppiProps = {
    L: Localisations,
    kayttajaTyyppi: ?SallitutKayttajatyypit,
    setSallittuKayttajatyyppi: () => void,
};

const KayttooikeusryhmatSallittuKayttajatyyppi = ({kayttajaTyyppi, L, setSallittuKayttajatyyppi}: KayttooikeusryhmatSallittuKayttajatyyppiProps) => {
    return <div className="kayttooikeusryhmat-sallittu-kayttajatyyppi-wrapper">
        <span className="oph-h4 oph-bold">{L['KAYTTOOIKEUSRYHMAT_KAYTTAJATYYPPI_OTSIKKO']}</span>
        <label className="oph-checkable oph-field-is-required" htmlFor="kayttooikeusryhmaKayttajatyyppi">
            <input id="kayttooikeusryhmaKayttajatyyppi"
                   className="oph-checkable-input"
                   type="checkbox"
                   onChange={setSallittuKayttajatyyppi}
                   checked={kayttajaTyyppi === 'PALVELU'} />
            <span className="oph-checkable-text">{L['KAYTTOOIKEUSRYHMAT_KAYTTAJATYYPPI_VAIN_PALVELU']}</span>
        </label>
    </div>;
};

const mapStateToProps = (state) => ({
    L: state.l10n.localisations[state.locale],
});

export default connect(mapStateToProps, {})(KayttooikeusryhmatSallittuKayttajatyyppi);
