import React from 'react';
import { Link } from 'react-router';

import { useLocalisations } from '../selectors';
import { OphDsErrorPage } from './design-system/OphDsErrorPage';

type Props = {
    link: string;
};

export const GenericErrorPage = ({ link }: Props) => {
    const { L } = useLocalisations();
    return (
        <OphDsErrorPage header={L('TAPAHTUI_ODOTTAMATON_VIRHE')}>
            <p>{L('KAYTTOOIKEUSRYHMAT_ODOTTAMATON_VIRHE')}</p>
            <Link to={link} className="oph-ds-button">
                {L('SIIRRY_PALVELUN_ETUSIVULLE')}
            </Link>
        </OphDsErrorPage>
    );
};
