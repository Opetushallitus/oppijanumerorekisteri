import React, { useEffect, useState } from 'react';

import OppijoidenTuontiYhteenveto from './OppijoidenTuontiYhteenveto';
import OppijoidenTuontiListaus from './OppijoidenTuontiListaus';
import TuontiKoosteTable from './TuontiKoosteTable';
import { useLocalisations } from '../../selectors';
import { useGetOppijoidenTuontiListausQuery } from '../../api/oppijanumerorekisteri';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { mainNavigation } from '../navigation/navigationconfigurations';
import { OphDsRadioGroup } from '../design-system/OphDsRadioGroup';
import { OphDsInput } from '../design-system/OphDsInput';
import { useDebounce } from '../../useDebounce';

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
    useTitle(L('TITLE_OPPIJOIDENTUONTI'));
    useNavigation(mainNavigation, false);
    const [criteria, setCriteria] = useState<OppijoidenTuontiCriteria>(defaultCriteria);
    const [tuontikooste, setTuontikooste] = useState(false);
    const { data, isFetching } = useGetOppijoidenTuontiListausQuery(criteria);
    const [nimiHaku, setNimiHaku] = useState('');
    const debouncedSearch = useDebounce(nimiHaku, 300);

    useEffect(() => {
        if (debouncedSearch.length > 2 || debouncedSearch.length === 0) {
            setCriteria({ ...criteria, nimiHaku: debouncedSearch });
        }
    }, [debouncedSearch]);

    const onPageChange = (page: number, count: number) => {
        setCriteria({ ...criteria, page: String(page), count: String(count) });
    };

    return (
        <div className="mainContent wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h1>{L('NAVI_OPPIJOIDEN_TUONTI')}</h1>
            <OppijoidenTuontiYhteenveto />
            <OphDsRadioGroup<'true' | 'false'>
                checked={`${tuontikooste}`}
                groupName="tuontikooste"
                legend=""
                onChange={(t) => setTuontikooste(t === 'true')}
                radios={[
                    { id: 'true', value: 'true', label: L('OPPIJOIDEN_TUONTI_TUONTIKOOSTE') },
                    { id: 'false', value: 'false', label: L('OPPIJOIDEN_TUONTI_NAYTA_VIRHEET') },
                ]}
            />
            {tuontikooste ? (
                <TuontiKoosteTable />
            ) : (
                <>
                    <OphDsInput id="nimiHaku" label={L('OPPIJOIDEN_TUONTI_HAE_HENKILOITA')} onChange={setNimiHaku} />
                    {data && <OppijoidenTuontiListaus loading={isFetching} data={data} onPageChange={onPageChange} />}
                </>
            )}
        </div>
    );
};

export default OppijoidenTuontiContainer;
