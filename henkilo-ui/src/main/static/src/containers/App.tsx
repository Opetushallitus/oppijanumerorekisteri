import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';

import { useAppDispatch, type RootState } from '../store';
import { TopNavigation } from '../components/navigation/TopNavigation';
import Loader from '../components/common/icons/Loader';
import { fetchPrequels } from '../actions/prequel.actions';
import PropertySingleton from '../globals/PropertySingleton';
import { addGlobalNotification } from '../actions/notification.actions';
import { GlobalNotifications } from '../components/common/Notification/GlobalNotifications';
import { NOTIFICATIONTYPES } from '../components/common/Notification/notificationtypes';
import { useLocalisations } from '../selectors';
import { useGetOmatOrganisaatiotQuery, useGetOmattiedotQuery } from '../api/kayttooikeus';
import { useGetLocaleQuery } from '../api/oppijanumerorekisteri';
import { useGetLocalisationsQuery } from '../api/lokalisointi';
import { OphDsToasts } from '../components/design-system/OphDsToast';

import 'moment/locale/fi';
import 'moment/locale/sv';

type OwnProps = {
    children: React.ReactNode;
    location: { pathname?: string };
};

const fetchPrequelsIntervalInMillis = 30 * 1000;

const App = ({ children, location }: OwnProps) => {
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
        if (isInitialized) {
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
    }, [isInitialized]);

    return isInitialized ? (
        <div className="oph-typography mainContainer">
            <GlobalNotifications />
            <OphDsToasts />
            <TopNavigation pathName={location.pathname} />
            {children}
        </div>
    ) : (
        <Loader />
    );
};

export default App;
