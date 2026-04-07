import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';

import Loader from '../components/common/icons/Loader';
import background from '../img/unauthenticated_background.jpg';
import ophLogo from '../img/logo_oph.svg';
import okmLogo from '../img/logo_okm.png';
import { useGetLocalisationsQuery } from '../api/lokalisointi';
import { useGetOmattiedotQuery } from '../api/kayttooikeus';
import { OphDsToasts } from '../components/design-system/OphDsToast';
import { KirjauduUlosVirhe } from './KirjauduUlosVirhe';

const App = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const { isSuccess: isLocalisationsSuccess } = useGetLocalisationsQuery('henkilo-ui');
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery();

    useEffect(() => {
        window.document.body.style.backgroundImage = `url('${background}')`;
        window.document.body.style.backgroundRepeat = 'no-repeat';
        window.document.body.style.backgroundSize = 'cover';
        window.document.body.style.backgroundAttachment = 'fixed';
        window.document.body.style.backgroundPosition = '0px 100px';
        window.document.body.style.backgroundColor = 'white';
    }, []);

    useEffect(() => {
        if (isLocalisationsSuccess) {
            setIsInitialized(true);
        }
    }, [isLocalisationsSuccess]);

    return !isInitialized ? (
        <Loader />
    ) : isOmattiedotSuccess && omattiedot?.oidHenkilo ? (
        <KirjauduUlosVirhe />
    ) : (
        <div className="oph-typography mainContainer">
            <OphDsToasts />
            <div style={{ textAlign: 'center' }}>
                <div>
                    <img src={ophLogo} alt="oph logo" style={{ paddingLeft: '19px', paddingTop: '5px' }} />{' '}
                    <img src={okmLogo} alt="okm logo" style={{ paddingLeft: '70px' }} />
                </div>
            </div>
            <div className="mainContent">
                <Outlet />
            </div>
        </div>
    );
};

export default App;
