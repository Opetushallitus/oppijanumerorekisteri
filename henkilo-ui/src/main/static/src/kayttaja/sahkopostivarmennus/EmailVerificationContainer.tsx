import React, { useEffect, useState } from 'react';
import { urls } from 'oph-urls-js';
import { useParams } from 'react-router';

import { useAppDispatch } from '../store';
import { EmailVerificationPage } from './EmailVerificationPage';
import { http } from '../../http';
import Loader from '../../components/common/icons/Loader';
import { Henkilo } from '../../types/domain/oppijanumerorekisteri/henkilo.types';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { add } from '../../slices/toastSlice';

const EmailVerificationContainer = () => {
    const dispatch = useAppDispatch();
    const params = useParams();
    const { getLocalisations } = useLocalisations();
    const [loading, setLoading] = useState(true);
    const [henkilo, setHenkilo] = useState<Partial<Henkilo>>({ yhteystiedotRyhma: [] });
    const L = getLocalisations(params.locale);

    useTitle(L['TITLE_SAHKOPOSTI_VARMISTAMINEN']);

    const errorNotification = (header: string) => {
        dispatch(
            add({
                id: `KAYTTOOIKEUSRAPORTTI_ERROR-${Math.random()}`,
                header,
                type: 'error',
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
            loginToken={params.loginToken}
            errorNotification={errorNotification}
            L={L}
            locale={params.locale}
        />
    );
};

export default EmailVerificationContainer;
