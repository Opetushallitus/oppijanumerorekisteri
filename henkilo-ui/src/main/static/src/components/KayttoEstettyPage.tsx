import React from 'react';
import { Link } from 'react-router';

import { useLocalisations } from '../selectors';
import { OphDsErrorPage } from './design-system/OphDsErrorPage';

export const KayttoEstettyPage = () => {
    const { L } = useLocalisations();
    return (
        <OphDsErrorPage header={L('VIRHE_KIRJAUTUNUT_KAYTTO_ESTETTY')}>
            <p>
                <Link className="oph-ds-button" to="/omattiedot">
                    {L('VIRHE_KIRJAUTUNUT_KAYTTO_ESTETTY_HAE')}
                </Link>
            </p>
        </OphDsErrorPage>
    );
};
