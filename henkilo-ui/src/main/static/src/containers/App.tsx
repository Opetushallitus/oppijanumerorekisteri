import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { Outlet } from 'react-router';

import { useAppDispatch } from '../store';
import { TopNavigation } from '../components/navigation/TopNavigation';
import Loader from '../components/common/icons/Loader';
import PropertySingleton from '../globals/PropertySingleton';
import { useLocalisations } from '../selectors';
import { useGetOmatOrganisaatiotQuery, useGetOmattiedotQuery, useGetOtuvaPrequelQuery } from '../api/kayttooikeus';
import { useGetLocaleQuery, useGetOnrPrequelQuery } from '../api/oppijanumerorekisteri';
import { useGetLocalisationsQuery } from '../api/lokalisointi';
import { OphDsToasts } from '../components/design-system/OphDsToast';
import { add } from '../slices/toastSlice';

import 'moment/locale/fi';
import 'moment/locale/sv';

const App = () => {
    const dispatch = useAppDispatch();
    const [isInitialized, setIsInitialized] = useState(false);
    const { isSuccess: isOnrPrequelSuccess } = useGetOnrPrequelQuery(undefined, { pollingInterval: 30000 });
    const { isSuccess: isOtuvaPrequelSuccess } = useGetOtuvaPrequelQuery(undefined, { pollingInterval: 30000 });
    const { data: locale, isSuccess: isLocaleSuccess } = useGetLocaleQuery(undefined, {
        skip: !isOnrPrequelSuccess || !isOtuvaPrequelSuccess,
    });
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery(undefined, {
        skip: !isOnrPrequelSuccess || !isOtuvaPrequelSuccess,
    });
    const { isSuccess: isLocalisationsSuccess } = useGetLocalisationsQuery('henkilo-ui');
    const { L } = useLocalisations();

    useGetOmatOrganisaatiotQuery({ oid: omattiedot?.oidHenkilo, locale }, { skip: !omattiedot?.oidHenkilo || !locale });

    useEffect(() => {
        if (isOmattiedotSuccess && isLocaleSuccess && isLocalisationsSuccess && !!locale && !!L) {
            moment.locale(locale);
            moment.defaultFormat = PropertySingleton.getState().PVM_MOMENT_FORMAATTI;

            if (locale?.toLowerCase() !== 'fi' && locale?.toLowerCase() !== 'sv') {
                dispatch(
                    add({
                        id: `EN_LOCALE_KEY-${Math.random()}`,
                        type: 'error',
                        header: L['HENKILO_YHTEISET_ASIOINTIKIELI_EN_VAROITUS'],
                    })
                );
            }

            setIsInitialized(true);
        }
    }, [isOmattiedotSuccess, isLocaleSuccess, isLocalisationsSuccess, locale, L]);

    return isInitialized ? (
        <div className="oph-typography mainContainer">
            <OphDsToasts />
            <TopNavigation />
            <Outlet />
        </div>
    ) : (
        <Loader />
    );
};

export default App;
