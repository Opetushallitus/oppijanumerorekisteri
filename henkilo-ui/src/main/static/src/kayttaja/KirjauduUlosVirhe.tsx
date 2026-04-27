import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../selectors';
import { OphDsErrorPage } from '../components/design-system/OphDsErrorPage';
import { useTitle } from '../useTitle';

export const KirjauduUlosVirhe = () => {
    const { getLocalisations } = useLocalisations(true);
    const params = useParams();
    const L = getLocalisations(params.locale);

    useTitle(L['TITLE_VIRHESIVU']);

    return (
        <OphDsErrorPage header={L['VIRHE_PAGE_DEFAULT_OTSIKKO']!}>
            <p>{L['KAYTTAJA_ULOSKIRJAUTUMISEN_PAKOTUS']}</p>
            <p>
                <a className="oph-ds-button" href="/cas/logout">
                    {L['KAYTTAJA_ULOSKIRJAUTUMISEN_LINKKI']}
                </a>
            </p>
        </OphDsErrorPage>
    );
};
