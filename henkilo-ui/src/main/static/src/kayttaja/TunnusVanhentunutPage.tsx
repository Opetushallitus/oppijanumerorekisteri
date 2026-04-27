import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../selectors';
import { useTitle } from '../useTitle';
import { OphDsErrorPage } from '../components/design-system/OphDsErrorPage';

export const TunnusVanhentunutPage = () => {
    const params = useParams();
    const { getLocalisations } = useLocalisations();
    const L = getLocalisations(params.locale);

    useTitle(L['TUNNUS_VANHENTUNUT_OTSIKKO']);

    return (
        <OphDsErrorPage header={L['TUNNUS_VANHENTUNUT_OTSIKKO']!}>
            <p>{L['TUNNUS_VANHENTUNUT_TEKSTI']}</p>
            <p>
                {L['TUNNUS_VANHENTUNUT_LINKKI']}
                {': '}
                <a href="https://wiki.eduuni.fi/x/IYRcCw">https://wiki.eduuni.fi/x/IYRcCw</a>
            </p>
        </OphDsErrorPage>
    );
};
