import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { useAppDispatch, type RootState } from '../store';
import { fetchFrontProperties } from '../actions/frontProperties.actions';
import TopNavigation from '../components/navigation/TopNavigation';
import Loader from '../components/common/icons/Loader';
import { fetchPrequels } from '../actions/prequel.actions';
import PropertySingleton from '../globals/PropertySingleton';
import { addGlobalNotification } from '../actions/notification.actions';
import { GlobalNotifications } from '../components/common/Notification/GlobalNotifications';
import { LocalisationState } from '../reducers/l10n.reducer';
import { ophLightGray } from '../components/navigation/navigation.utils';
import { Locale } from '../types/locale.type';
import background from '../img/unauthenticated_background.jpg';
import { RouteType } from '../routes';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { fetchOrganisationNames } from '../actions/organisaatio.actions';

import 'moment/locale/fi';
import 'moment/locale/sv';

type OwnProps = {
    children: React.ReactNode;
    location: { pathname?: string };
    routes: Array<RouteType>;
    params: Record<string, string>;
};

const fetchPrequelsIntervalInMillis = 30 * 1000;

const App = ({ children, location, params, routes }: OwnProps) => {
    const [lastPath, setLastPath] = useState<string>(null);
    const [route, setRoute] = useState<RouteType>(routes[routes.length - 1]);
    const [isInitialized, setIsInitialized] = useState(false);
    const frontPropertiesInitialized = useSelector<RootState, boolean>((state) => state.frontProperties.initialized);
    const omattiedotInitialized = useSelector<RootState, boolean>((state) => state.omattiedot.initialized);
    const prequelsNotLoadedCount = useSelector<RootState, number>((state) => state.prequels.notLoadedCount);
    const l10n = useSelector<RootState, LocalisationState>((state) => state.l10n);
    const locale = useSelector<RootState, Locale>((state) => state.locale);
    const dispatch = useAppDispatch();

    const setBackGround = (route: RouteType) => {
        if (route.isUnauthenticated) {
            window.document.body.style.backgroundImage = `url('${background}')`;
            window.document.body.style.backgroundRepeat = 'no-repeat';
            window.document.body.style.backgroundSize = 'cover';
            window.document.body.style.backgroundAttachment = 'fixed';
            window.document.body.style.backgroundPosition = '0px 100px';
            window.document.body.style.backgroundColor = 'white';
        } else {
            // If bgColor is not provided guess by if component has updated navibar on mount
            window.document.body.style.backgroundColor = ophLightGray;
        }
    };

    useEffect(() => {
        dispatch<any>(fetchFrontProperties());
        dispatch<any>(fetchOrganisationNames());
        const prequel = setInterval(() => dispatch<any>(fetchPrequels()), fetchPrequelsIntervalInMillis);
        return () => clearTimeout(prequel);
    }, []);

    useEffect(() => {
        if (
            frontPropertiesInitialized &&
            l10n.localisationsInitialized &&
            omattiedotInitialized &&
            prequelsNotLoadedCount === 0
        ) {
            setIsInitialized(true);
            moment.locale(locale);
            moment.defaultFormat = PropertySingleton.getState().PVM_MOMENT_FORMAATTI;
        }
    }, [frontPropertiesInitialized, l10n, omattiedotInitialized, prequelsNotLoadedCount]);

    useEffect(() => {
        const route = routes[routes.length - 1];
        if (!lastPath || lastPath !== route.path) {
            setBackGround(route);
            setLastPath(location.pathname);
            setRoute(route);
        }
        if (isInitialized) {
            const L = l10n.localisations[locale];
            window.document.title = L[route.title] || L['TITLE_DEFAULT'];
            if (locale.toLowerCase() !== 'fi' && locale.toLowerCase() !== 'sv') {
                dispatch(
                    addGlobalNotification({
                        key: 'EN_LOCALE_KEY',
                        type: NOTIFICATIONTYPES.WARNING,
                        title: L['HENKILO_YHTEISET_ASIOINTIKIELI_EN_VAROITUS'],
                    })
                );
            }
        }
    }, [routes, isInitialized]);

    return isInitialized ? (
        <div className="oph-typography mainContainer">
            <GlobalNotifications />
            <TopNavigation pathName={location.pathname} route={route} params={params} />
            <div className="mainContent">{children}</div>
        </div>
    ) : (
        <Loader />
    );
};

export default App;
