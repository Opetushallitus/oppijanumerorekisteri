import React from 'react';

import { useLocalisations } from '../selectors';
import { useTitle } from '../useTitle';

export function PalvelukayttajaInfo() {
    const { L } = useLocalisations();
    useTitle('Palvelukäyttäjä');
    return (
        <div className="oph-typography mainContainer">
            <div className="mainContent">
                <div className={'wrapper'}>
                    <div className="user-content">
                        <div className="header">
                            <p className="oph-h2 oph-bold">
                                {L('PALVELUKAYTTAJAINFO_OTSIKKO') ??
                                    'Olet kirjautunut Opintopolkuun palvelukäyttäjätunnuksella'}
                            </p>
                        </div>
                        <p>
                            {L('PALVELUKAYTTAJAINFO_LEIPATEKSTI') ??
                                'Palvelukäyttäjätunnuksella ei voi käyttää henkilöpalvelun käyttöliittymää.'}
                        </p>
                        <p>
                            {L('PALVELUKAYTTAJAINFO_LINKIT_KUVAUS') ??
                                'Oppijanumerorekisterin ja käyttöoikeuspalvelun rajapintoihin voi tutustua seuraavista linkeistä:'}
                        </p>
                        <ul>
                            <li>
                                <a href="/oppijanumerorekisteri-service/swagger-ui/#/">
                                    {L('PALVELUKAYTTAJAINFO_LINKIT_OPPIJANUMEROREKISTERI') ??
                                        'Oppijanumerorekisterin Swagger-rajapintakuvaus'}
                                </a>
                            </li>
                            <li>
                                <a href="/kayttooikeus-service/swagger-ui/#/">
                                    {L('PALVELUKAYTTAJAINFO_LINKIT_KAYTTOOIKEUSPALVELU') ??
                                        'Käyttöoikeuspalvelun Swagger-rajapintakuvaus'}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
