import './KayttooikeusryhmatSallittuKayttajatyyppi.css';
import React from 'react';
import { connect } from 'react-redux';
import { SallitutKayttajatyypit } from './KayttooikeusryhmaPage';
import { Localisations } from '../../../types/localisation.type';

type OwnProps = {
    kayttajaTyyppi: SallitutKayttajatyypit | null | undefined;
    setSallittuKayttajatyyppi: () => void;
};

type KayttooikeusryhmatSallittuKayttajatyyppiProps = OwnProps & {
    L: Localisations;
};

const KayttooikeusryhmatSallittuKayttajatyyppi = ({
    kayttajaTyyppi,
    L,
    setSallittuKayttajatyyppi,
}: KayttooikeusryhmatSallittuKayttajatyyppiProps) => {
    return (
        <div className="kayttooikeusryhmat-sallittu-kayttajatyyppi-wrapper">
            <span className="oph-h4 oph-bold">{L['KAYTTOOIKEUSRYHMAT_KAYTTAJATYYPPI_OTSIKKO']}</span>
            <label className="oph-checkable oph-field-is-required" htmlFor="kayttooikeusryhmaKayttajatyyppi">
                <input
                    id="kayttooikeusryhmaKayttajatyyppi"
                    className="oph-checkable-input"
                    type="checkbox"
                    onChange={setSallittuKayttajatyyppi}
                    checked={kayttajaTyyppi === 'PALVELU'}
                />
                <span className="oph-checkable-text">{L['KAYTTOOIKEUSRYHMAT_KAYTTAJATYYPPI_VAIN_PALVELU']}</span>
            </label>
        </div>
    );
};

const mapStateToProps = state => ({
    L: state.l10n.localisations[state.locale],
});

export default connect<KayttooikeusryhmatSallittuKayttajatyyppiProps, OwnProps>(
    mapStateToProps,
    {}
)(KayttooikeusryhmatSallittuKayttajatyyppi);
