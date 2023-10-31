import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { useAppDispatch, type RootState } from '../store';
import TopNavigation from '../components/navigation/TopNavigation';
import Loader from '../components/common/icons/Loader';
import { fetchPrequels } from '../actions/prequel.actions';
import PropertySingleton from '../globals/PropertySingleton';
import { addGlobalNotification } from '../actions/notification.actions';
import { GlobalNotifications } from '../components/common/Notification/GlobalNotifications';
import { ophLightGray } from '../components/navigation/navigation.utils';
import { RouteType } from '../routes';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { fetchOrganisationNames } from '../actions/organisaatio.actions';
import { useLocalisations } from '../selectors';
import { useGetOmatOrganisaatiotQuery, useGetOmattiedotQuery } from '../api/kayttooikeus';
import { useGetLocaleQuery } from '../api/oppijanumerorekisteri';
import { useGetLocalisationsQuery } from '../api/lokalisointi';

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
    const prequelsNotLoadedCount = useSelector<RootState, number>((state) => state.prequels.notLoadedCount);
    const { isSuccess: isLocaleSuccess } = useGetLocaleQuery(undefined, {
        skip: prequelsNotLoadedCount > 0,
    });
    const { data: omattiedot, isLoading: isOmattiedotLoading } = useGetOmattiedotQuery(undefined, {
        skip: prequelsNotLoadedCount > 0,
    });
    const { isSuccess: isLocalisationsSuccess } = useGetLocalisationsQuery('henkilo-ui');
    const { L, locale } = useLocalisations();
    useGetOmatOrganisaatiotQuery({ oid: omattiedot?.oidHenkilo, locale }, { skip: !omattiedot?.oidHenkilo || !locale });
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch<any>(fetchPrequels());
        dispatch<any>(fetchOrganisationNames());
        const prequel = setInterval(() => dispatch<any>(fetchPrequels()), fetchPrequelsIntervalInMillis);
        return () => clearTimeout(prequel);
    }, []);

    useEffect(() => {
        if (!isOmattiedotLoading && isLocaleSuccess && prequelsNotLoadedCount <= 0 && isLocalisationsSuccess) {
            setIsInitialized(true);
            moment.locale(locale);
            moment.defaultFormat = PropertySingleton.getState().PVM_MOMENT_FORMAATTI;
        }
    }, [isOmattiedotLoading, isLocaleSuccess, prequelsNotLoadedCount, isLocalisationsSuccess]);

    useEffect(() => {
        const route = routes[routes.length - 1];
        if (!lastPath || lastPath !== route.path) {
            window.document.body.style.backgroundColor = ophLightGray;
            setLastPath(location.pathname);
            setRoute(route);
        }
        if (isInitialized) {
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
