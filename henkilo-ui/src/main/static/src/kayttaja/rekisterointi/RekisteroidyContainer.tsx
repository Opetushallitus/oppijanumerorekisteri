import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RouteActions } from 'react-router-redux';

import RekisteroidyPage from './RekisteroidyPage';
import { fetchKieliKoodisto } from '../../actions/koodisto.actions';
import Loader from '../../components/common/icons/Loader';
import VirhePage from '../../components/common/page/VirhePage';
import { useAppDispatch, type KayttajaRootState } from '../store';
import type { KoodistoState } from '../../reducers/koodisto.reducer';
import { useLocalisations } from '../../selectors';
import { useGetKutsuByTokenQuery } from '../../api/kayttooikeus';
import { useTitle } from '../../useTitle';

type OwnProps = {
    location: { query: Record<string, string> };
    router: RouteActions;
};

const RekisteroidyContainer = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { l10n, locale } = useLocalisations();
    const koodisto = useSelector<KayttajaRootState, KoodistoState>((state) => state.koodisto);
    const temporaryToken = props.location.query['temporaryKutsuToken'];
    const { data: kutsu, isLoading: isKutsuLoading, isError } = useGetKutsuByTokenQuery(temporaryToken);

    useTitle(l10n.localisations[kutsu?.asiointikieli ?? 'fi']['TITLE_REKISTEROINTI']);

    useEffect(() => {
        dispatch<any>(fetchKieliKoodisto());
    }, []);

    if (koodisto.kieliKoodistoLoading || isKutsuLoading) {
        return <Loader />;
    } else if (isError) {
        return <VirhePage text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
    }
    return (
        <RekisteroidyPage
            koodisto={koodisto}
            kutsu={{ ...kutsu, temporaryToken }}
            L={l10n.localisations[locale]}
            locale={kutsu.asiointikieli}
            router={props.router}
        />
    );
};

export default RekisteroidyContainer;
