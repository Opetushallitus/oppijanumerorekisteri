import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import RekisteroidyPage from './RekisteroidyPage';
import { fetchKieliKoodisto } from '../../actions/koodisto.actions';
import Loader from '../common/icons/Loader';
import VirhePage from '../common/page/VirhePage';
import { useAppDispatch, type RootState } from '../../store';
import type { KoodistoState } from '../../reducers/koodisto.reducer';
import { useLocalisations } from '../../selectors';
import { useGetKutsuByTokenQuery, useGetOmattiedotQuery } from '../../api/kayttooikeus';

type OwnProps = {
    location: { query: Record<string, string> };
};

const RekisteroidyContainer = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { l10n } = useLocalisations();
    const { data: omattiedot, isLoading: isOmattiedotLoading } = useGetOmattiedotQuery();
    const koodisto = useSelector<RootState, KoodistoState>((state) => state.koodisto);
    const temporaryToken = props.location.query['temporaryKutsuToken'];
    const { data: kutsu, isLoading: isKutsuLoading, isError } = useGetKutsuByTokenQuery(temporaryToken);

    useEffect(() => {
        dispatch<any>(fetchKieliKoodisto());
    }, []);

    if (koodisto.kieliKoodistoLoading || isKutsuLoading || isOmattiedotLoading || !l10n) {
        return <Loader />;
    } else if (omattiedot?.oidHenkilo !== undefined) {
        return <VirhePage text={'REKISTEROIDY_KIRJAUTUNUT'} />;
    } else if (isError) {
        return <VirhePage text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
    }
    return (
        <RekisteroidyPage
            koodisto={koodisto}
            kutsu={{ ...kutsu, temporaryToken }}
            L={l10n.localisations[kutsu.asiointikieli]}
            locale={kutsu.asiointikieli}
        />
    );
};

export default RekisteroidyContainer;
