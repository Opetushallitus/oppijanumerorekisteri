import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useLocation, useNavigate } from 'react-router';

import { useLocalisations } from '../selectors';

import styles from './RekisteroityminenPage.module.css';

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
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.icon}>
                    <svg width="24" height="24" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18ZM14.59 5.58L8 12.17L5.41 9.59L4 11L8 15L16 7L14.59 5.58Z"
                            fill="white"
                        />
                    </svg>
                </div>
                <div className={styles.content}>
                    <h1>{L('REKISTEROITYMINEN_VALMIS_OTSIKKO')}</h1>
                    <p>
                        {L('REKISTEROITYMINEN_VALMIS_TUNNISTAUTUMINEN')}{' '}
                        <Link to="/omattiedot">{L('REKISTEROITYMINEN_VALMIS_OMATTIEDOT')}</Link>.
                    </p>
                    <ReactMarkdown>{L('REKISTEROITYMINEN_VALMIS_SISALTO')}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
};
