import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

export const RekisteroityminenPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const search = new URLSearchParams(location.search);
        if (search.get('ticket')) {
            navigate(location.pathname, { replace: true });
        }
    }, [location]);

    return (
        <div className="infoPageWrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '360px' }}>✅</span>
            <a href="/henkilo-ui/omattiedot">Omiin tietoihin</a>
            <a href={`/cas/logout?service=https://${window.location.host}`}>Kirjaudu ulos</a>
        </div>
    );
};
