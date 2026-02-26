import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { registerLocale, setDefaultLocale } from 'react-datepicker';
import { fi } from 'date-fns/locale/fi';
import { skipToken } from '@reduxjs/toolkit/query/react';

import { useAppDispatch } from '../store';
import { TopNavigation } from '../components/navigation/TopNavigation';
import Loader from '../components/common/icons/Loader';
import { useLocalisations } from '../selectors';
import { useGetOmatOrganisaatiotQuery, useGetOmattiedotQuery, useGetOtuvaPrequelQuery } from '../api/kayttooikeus';
import { useGetLocaleQuery, useGetOnrPrequelQuery } from '../api/oppijanumerorekisteri';
import { useGetLocalisationsQuery } from '../api/lokalisointi';
import { OphDsToasts } from '../components/design-system/OphDsToast';
import { add } from '../slices/toastSlice';

registerLocale('fi', fi);
setDefaultLocale('fi');

const App = () => {
    const { isSuccess: isOnrPrequelSuccess } = useGetOnrPrequelQuery(undefined, { pollingInterval: 30000 });
    const { isSuccess: isOtuvaPrequelSuccess } = useGetOtuvaPrequelQuery(undefined, { pollingInterval: 30000 });
    if (!isOnrPrequelSuccess || !isOtuvaPrequelSuccess) {
        return <Loader />;
    } else {
        return <PostPrequelApp />;
    }
};

const PostPrequelApp = () => {
    const dispatch = useAppDispatch();
    const [isInitialized, setIsInitialized] = useState(false);
    const { data: locale, isSuccess: isLocaleSuccess } = useGetLocaleQuery();
    const { data: omattiedot, isSuccess: isOmattiedotSuccess } = useGetOmattiedotQuery();
    const { isSuccess: isLocalisationsSuccess } = useGetLocalisationsQuery('henkilo-ui');
    const { L } = useLocalisations();
    const oid = omattiedot?.oidHenkilo;
    useGetOmatOrganisaatiotQuery(oid && locale ? { oid, locale } : skipToken);

    useEffect(() => {
        if (isOmattiedotSuccess && isLocaleSuccess && isLocalisationsSuccess && !!locale && !!L) {
            if (locale !== 'fi' && locale !== 'sv') {
                dispatch(
                    add({
                        id: `EN_LOCALE_KEY-${Math.random()}`,
                        type: 'error',
                        header: L('HENKILO_YHTEISET_ASIOINTIKIELI_EN_VAROITUS'),
                    })
                );
            } else {
                document.documentElement.lang = locale;
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
