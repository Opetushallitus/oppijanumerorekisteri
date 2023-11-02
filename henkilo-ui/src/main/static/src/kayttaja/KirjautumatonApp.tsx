import React, { useEffect, useState } from 'react';
import moment from 'moment';

import { useAppDispatch } from '../store';
import Loader from '../components/common/icons/Loader';
import PropertySingleton from '../globals/PropertySingleton';
import { addGlobalNotification } from '../actions/notification.actions';
import { GlobalNotifications } from '../components/common/Notification/GlobalNotifications';
import background from '../img/unauthenticated_background.jpg';
import { RouteType } from './routes';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { useLocalisations } from '../selectors';
import ophLogo from '../img/logo_oph.svg';
import okmLogo from '../img/logo_okm.png';
import { useGetLocalisationsQuery } from '../api/lokalisointi';
import { useGetOmattiedotQuery } from '../api/kayttooikeus';
import VirhePage from '../components/common/page/VirhePage';

import 'moment/locale/fi';
import 'moment/locale/sv';

type OwnProps = {
    children: React.ReactNode;
    routes: Array<RouteType>;
};

const App = ({ children, routes }: OwnProps) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const { l10n, locale } = useLocalisations();
    const { isSuccess: isLocalisationsSuccess } = useGetLocalisationsQuery('henkilo-ui');
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery();
    const dispatch = useAppDispatch();

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

    useEffect(() => {
        if (locale) {
            if (['fi', 'sv'].includes(locale.toLowerCase())) {
                moment.locale(locale);
                moment.defaultFormat = PropertySingleton.getState().PVM_MOMENT_FORMAATTI;
            } else {
                dispatch(
                    addGlobalNotification({
                        key: 'EN_LOCALE_KEY',
                        type: NOTIFICATIONTYPES.WARNING,
                        title: l10n[locale]['HENKILO_YHTEISET_ASIOINTIKIELI_EN_VAROITUS'],
                    })
                );
            }
        }
    }, [locale, l10n]);

    useEffect(() => {
        const route = routes[routes.length - 1];
        if (isInitialized && l10n && locale) {
            window.document.title = l10n[locale][route.title] ?? l10n[locale]['TITLE_DEFAULT'];
        }
    }, [routes, isInitialized, locale, l10n]);

    return !isInitialized ? (
        <Loader />
    ) : isOmattiedotSuccess && omattiedot?.oidHenkilo ? (
        <VirhePage text={'REKISTEROIDY_KIRJAUTUNUT'} />
    ) : (
        <div className="oph-typography mainContainer">
            <GlobalNotifications />
            <div style={{ textAlign: 'center' }}>
                <div>
                    <img src={ophLogo} alt="oph logo" style={{ paddingLeft: '19px', paddingTop: '5px' }} />{' '}
                    <img src={okmLogo} alt="okm logo" style={{ paddingLeft: '70px' }} />
                </div>
            </div>
            <div className="mainContent">{children}</div>
        </div>
    );
};

export default App;
