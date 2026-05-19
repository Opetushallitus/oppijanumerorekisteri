import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useLocation, useNavigate } from 'react-router';

import { useLocalisations } from '../selectors';
import { OphDsSuccessPage } from './design-system/OphDsSuccessPage';

export const RekisteroityminenPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { L } = useLocalisations();

    useEffect(() => {
        const search = new URLSearchParams(location.search);
        if (search.get('ticket')) {
            navigate(location.pathname, { replace: true });
        }
    }, [location]);

    return (
        <OphDsSuccessPage header={L('REKISTEROITYMINEN_VALMIS_OTSIKKO')}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    maxWidth: '900px',
                    textAlign: 'left',
                }}
            >
                <p>
                    {L('REKISTEROITYMINEN_VALMIS_TUNNISTAUTUMINEN')}{' '}
                    <Link to="/omattiedot">{L('REKISTEROITYMINEN_VALMIS_OMATTIEDOT')}</Link>.
                </p>
                <ReactMarkdown>{L('REKISTEROITYMINEN_VALMIS_SISALTO')}</ReactMarkdown>
            </div>
        </OphDsSuccessPage>
    );
};
