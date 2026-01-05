import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { useAppDispatch } from '../store';
import { EmailVerificationPage } from './EmailVerificationPage';
import Loader from '../../components/common/icons/Loader';
import { useLocalisations } from '../../selectors';
import { useTitle } from '../../useTitle';
import { add } from '../../slices/toastSlice';
import { useGetHenkiloByLoginTokenQuery } from '../../api/kayttooikeus';

const EmailVerificationContainer = () => {
    const dispatch = useAppDispatch();
    const params = useParams();
    const { getLocalisations } = useLocalisations();
    const { data: henkilo, isLoading, isError } = useGetHenkiloByLoginTokenQuery(params.loginToken!);
    const L = getLocalisations(params.locale);

    useTitle(L['TITLE_SAHKOPOSTI_VARMISTAMINEN']);

    useEffect(() => {
        if (isError) {
            errorNotification(L['REKISTEROIDY_TEMP_TOKEN_INVALID']);
        }
    }, [isError]);

    const errorNotification = (header?: string) => {
        dispatch(
            add({
                id: `KAYTTOOIKEUSRAPORTTI_ERROR-${Math.random()}`,
                header,
                type: 'error',
            })
        );
    };

    return isLoading || isError ? (
        <Loader />
    ) : (
        <EmailVerificationPage
            henkilo={henkilo!}
            loginToken={params.loginToken!}
            errorNotification={errorNotification}
            L={L}
            locale={params.locale!}
        />
    );
};

export default EmailVerificationContainer;
