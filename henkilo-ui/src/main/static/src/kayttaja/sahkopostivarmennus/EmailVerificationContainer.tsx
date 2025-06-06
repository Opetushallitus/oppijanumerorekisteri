import React, { useEffect, useState } from 'react';
import { RouteActions } from 'react-router-redux';
import { urls } from 'oph-urls-js';

import { useAppDispatch } from '../store';
import { Locale } from '../../types/locale.type';
import { EmailVerificationPage } from './EmailVerificationPage';
import { http } from '../../http';
import { addGlobalNotification } from '../../actions/notification.actions';
import { NOTIFICATIONTYPES } from '../../components/common/Notification/notificationtypes';
import Loader from '../../components/common/icons/Loader';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { toSupportedLocale } from '../../reducers/locale.reducer';

type OwnProps = {
    params: { loginToken?: string; locale?: Locale };
    router: RouteActions;
};

const EmailVerificationContainer = ({ params, router }: OwnProps) => {
    const dispatch = useAppDispatch();
    const { l10n } = useLocalisations();
    const [loading, setLoading] = useState(true);
    const [henkilo, setHenkilo] = useState<Partial<Henkilo>>({ yhteystiedotRyhma: [] });
    const locale = toSupportedLocale(params.locale);
    const L = l10n.localisations[locale];

    useTitle(L['TITLE_SAHKOPOSTI_VARMISTAMINEN']);

    const errorNotification = (title: string) => {
        dispatch(
            addGlobalNotification({
                key: 'KAYTTOOIKEUSRAPORTTI_ERROR',
                title,
                type: NOTIFICATIONTYPES.ERROR,
                autoClose: 10000,
            })
        );
    };

    useEffect(() => {
        const fetchHenkilo = async () => {
            const url = urls.url('kayttooikeus-service.cas.henkilo.bylogintoken', params.loginToken);
            try {
                const henkilo = await http.get<Henkilo>(url);
                setHenkilo(henkilo);
                setLoading(false);
            } catch (_error) {
                errorNotification(L['REKISTEROIDY_TEMP_TOKEN_INVALID']);
                setLoading(false);
            }
        };

        if (params.loginToken) {
            fetchHenkilo();
        }
    }, []);

    return loading ? (
        <Loader />
    ) : (
        <EmailVerificationPage
            henkilo={henkilo}
            locale={locale}
            L={L}
            loginToken={params.loginToken}
            router={router}
            errorNotification={errorNotification}
        />
    );
};

export default EmailVerificationContainer;
