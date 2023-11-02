import React, { useEffect } from 'react';

// "temporary" redirect to new separated kayttaja bundle for old routes
export const KayttajaRedirect = () => {
    useEffect(() => {
        window.location.replace(window.location.href.replace('/henkilo-ui/', '/henkilo-ui/kayttaja/'));
    }, []);

    return <React.Fragment></React.Fragment>;
};
