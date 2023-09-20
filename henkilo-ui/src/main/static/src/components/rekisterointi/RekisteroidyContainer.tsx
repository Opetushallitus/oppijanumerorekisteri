import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import RekisteroidyPage from './RekisteroidyPage';
import { fetchKieliKoodisto } from '../../actions/koodisto.actions';
import Loader from '../common/icons/Loader';
import { fetchKutsuByToken } from '../../actions/kutsu.actions';
import VirhePage from '../common/page/VirhePage';
import { useAppDispatch, type RootState } from '../../store';
import type { KoodistoState } from '../../reducers/koodisto.reducer';
import { useLocalisations } from '../../selectors';
import { OmattiedotState } from '../../reducers/omattiedot.reducer';
import { KutsuListState } from '../../reducers/kutsuList.reducer';
import { CasState } from '../../reducers/cas.reducer';

type OwnProps = {
    location: { query: Record<string, string> };
};

const RekisteroidyContainer = (props: OwnProps) => {
    const dispatch = useAppDispatch();
    const { l10n } = useLocalisations();
    const kutsuList = useSelector<RootState, KutsuListState>((state) => state.kutsuList);
    const omattiedot = useSelector<RootState, OmattiedotState>((state) => state.omattiedot);
    const koodisto = useSelector<RootState, KoodistoState>((state) => state.koodisto);
    const cas = useSelector<RootState, CasState>((state) => state.cas);

    useEffect(() => {
        dispatch<any>(fetchKieliKoodisto());
        dispatch<any>(fetchKutsuByToken(props.location.query['temporaryKutsuToken']));
    }, []);

    if (koodisto.kieliKoodistoLoading || kutsuList.kutsuByTokenLoading) {
        return <Loader />;
    } else if (omattiedot.data.oid !== undefined) {
        return <VirhePage text={'REKISTEROIDY_KIRJAUTUNUT'} />;
    } else if (cas.temporaryTokenInvalid) {
        return <VirhePage text={'REKISTEROIDY_TEMP_TOKEN_INVALID'} />;
    }
    return (
        <RekisteroidyPage
            koodisto={koodisto}
            kutsu={kutsuList.kutsuByToken}
            L={l10n[kutsuList.kutsuByToken.asiointikieli]}
            locale={kutsuList.kutsuByToken.asiointikieli}
        />
    );
};

export default RekisteroidyContainer;
