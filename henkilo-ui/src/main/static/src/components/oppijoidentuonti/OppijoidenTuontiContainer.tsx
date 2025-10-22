import React, { useState } from 'react';

import OppijoidenTuontiYhteenveto from './OppijoidenTuontiYhteenveto';
import OppijoidenTuontiListaus from './OppijoidenTuontiListaus';
import BooleanRadioButtonGroup from '../common/radiobuttongroup/BooleanRadioButtonGroup';
import DelayedSearchInput from '../henkilohaku/DelayedSearchInput';
import TuontiKoosteTable from './TuontiKoosteTable';
import { useLocalisations } from '../../selectors';
import { useGetOppijoidenTuontiListausQuery } from '../../api/oppijanumerorekisteri';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';

export type OppijoidenTuontiCriteria = {
    page: string;
    count: string;
    nimiHaku?: string;
};

const defaultCriteria = {
    page: '1',
    count: '20',
};

const OppijoidenTuontiContainer = () => {
    const { L } = useLocalisations();
    useTitle(L['TITLE_OPPIJOIDENTUONTI']);
    useNavigation(mainNavigation, false);
    const [criteria, setCriteria] = useState<OppijoidenTuontiCriteria>(defaultCriteria);
    const [tuontikooste, setTuontikooste] = useState(false);
    const { data, isFetching } = useGetOppijoidenTuontiListausQuery(criteria);

    const onChangeNimiHaku = (nimiHaku: string) => {
        setCriteria({ ...criteria, nimiHaku });
    };

    const onPageChange = (page: number, count: number) => {
        setCriteria({ ...criteria, page: String(page), count: String(count) });
    };

    return (
        <div className="mainContent wrapper">
            <h1 style={{ marginBottom: '20px' }}>{L['OPPIJOIDEN_TUONTI_YHTEENVETO_OTSIKKO']}</h1>
            <OppijoidenTuontiYhteenveto />

            <div className="flex-horizontal" style={{ margin: '20px 0' }}>
                <h1 className="flex-item-1">{L['OPPIJOIDEN_TUONTI_OPPIJAT_OTSIKKO']}</h1>
                <div className="flex-item-1 flex-align-right">
                    <BooleanRadioButtonGroup
                        value={tuontikooste}
                        onChange={() => setTuontikooste(!tuontikooste)}
                        trueLabel={L['OPPIJOIDEN_TUONTI_TUONTIKOOSTE']!}
                        falseLabel={L['OPPIJOIDEN_TUONTI_NAYTA_VIRHEET']!}
                    />
                </div>
            </div>
            {tuontikooste ? (
                <TuontiKoosteTable />
            ) : (
                <>
                    <DelayedSearchInput
                        setSearchQueryAction={onChangeNimiHaku}
                        defaultNameQuery={criteria.nimiHaku}
                        minSearchValueLength={2}
                        placeholder={L['OPPIJOIDEN_TUONTI_HAE_HENKILOITA']}
                    />
                    {data && <OppijoidenTuontiListaus loading={isFetching} data={data} onPageChange={onPageChange} />}
                </>
            )}
        </div>
    );
};

export default OppijoidenTuontiContainer;
