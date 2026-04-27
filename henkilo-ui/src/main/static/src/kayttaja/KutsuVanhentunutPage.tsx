import React from 'react';
import { useParams } from 'react-router';

import { useLocalisations } from '../selectors';
import { useTitle } from '../useTitle';
import { OphDsErrorPage } from '../components/design-system/OphDsErrorPage';

export const KutsuVanhentunutPage = () => {
    const params = useParams();
    const { getLocalisations } = useLocalisations();
    const L = getLocalisations(params.locale);

    useTitle(L['VAHVATUNNISTUSINFO_VIRHE_VANHA_KUTSU_OTSIKKO']);

    return (
        <OphDsErrorPage header={L['VAHVATUNNISTUSINFO_VIRHE_VANHA_KUTSU_OTSIKKO']!}>
            <p style={{ textAlign: 'center' }}>{L['VAHVATUNNISTUSINFO_VIRHE_VANHA_KUTSU_TEKSTI']}</p>
        </OphDsErrorPage>
    );
};
