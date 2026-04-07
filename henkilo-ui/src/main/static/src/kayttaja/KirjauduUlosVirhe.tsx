import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../selectors';
import VirhePage from './VirhePage';

export const KirjauduUlosVirhe = () => {
    const { getLocalisations } = useLocalisations(true);
    const params = useParams();
    const L = getLocalisations(params.locale);

    return (
        <VirhePage>
            <p className="oph-bold">{L['KAYTTAJA_ULOSKIRJAUTUMISEN_PAKOTUS']}</p>
            <p className="oph-bold">
                <a href="/cas/logout">{L['KAYTTAJA_ULOSKIRJAUTUMISEN_LINKKI']}</a>
            </p>
        </VirhePage>
    );
};
