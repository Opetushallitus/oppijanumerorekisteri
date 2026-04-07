import React from 'react';

export const RekisteroityminenPage = () => {
    return (
        <div className="infoPageWrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '360px' }}>✅</span>
            <a href="/henkilo-ui/omattiedot">Omiin tietoihin</a>
            <a href={`/cas/logout?service=https://${window.location.host}`}>Kirjaudu ulos</a>
        </div>
    );
};
