import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router';

import Loader from '../components/common/icons/Loader';
import background from '../img/unauthenticated_background.jpg';
import { useLocalisations } from '../selectors';
import ophLogo from '../img/logo_oph.svg';
import okmLogo from '../img/logo_okm.png';
import { useGetLocalisationsQuery } from '../api/lokalisointi';
import { useGetOmattiedotQuery } from '../api/kayttooikeus';
import VirhePage from './VirhePage';
import { OphDsToasts } from '../components/design-system/OphDsToast';

const App = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const { getLocalisations } = useLocalisations();
    const params = useParams();
    const { isSuccess: isLocalisationsSuccess } = useGetLocalisationsQuery('henkilo-ui');
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery();
    const L = getLocalisations(params.locale) ?? {};

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
        <VirhePage>
            <p className="oph-bold">{L['KAYTTAJA_ULOSKIRJAUTUMISEN_PAKOTUS']}</p>
            <p className="oph-bold">
                <a href="/cas/logout">{L['KAYTTAJA_ULOSKIRJAUTUMISEN_LINKKI']}</a>
            </p>
        </VirhePage>
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
