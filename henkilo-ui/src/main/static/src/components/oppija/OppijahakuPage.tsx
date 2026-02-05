import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';

import { useLocalisations } from '../../selectors';
import { useDebounce } from '../../useDebounce';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsChechbox } from '../design-system/OphDsCheckbox';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsTable } from '../design-system/OphDsTable';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { virkailijaNavigation } from '../navigation/navigationconfigurations';
import { OppijahakuCriteria, usePostOppijahakuQuery } from '../../api/oppijanumerorekisteri';
import { RootState, useAppDispatch } from '../../store';
import { setState as _setState } from '../../slices/oppijahakuSlice';

const DebouncedNameQuery = ({ defaultValue, onChange }: { defaultValue?: string; onChange: (s: string) => void }) => {
    const { L } = useLocalisations();
    const [nameQuery, setNameQuery] = useState(defaultValue ?? '');
    const debounced = useDebounce(nameQuery, 400);

    useEffect(() => {
        onChange(debounced);
    }, [debounced]);

    return (
        <OphDsInput id="query" label={L['OPPIJAHAKU_HAKUTERMI']!} onChange={setNameQuery} defaultValue={defaultValue} />
    );
};

export const OppijahakuPage = () => {
    const { L } = useLocalisations();
    useTitle('Oppijahaku');
    useNavigation(virkailijaNavigation, false);

    const state = useSelector<RootState, OppijahakuCriteria>((state) => state.oppijahaku);
    const setState = (newState: OppijahakuCriteria) => useAppDispatch()(_setState(newState));
    const [criteria, setCriteria] = useState<OppijahakuCriteria>(state);
    const skip = !criteria.query || criteria.query.length < 3;
    const { data, isFetching } = usePostOppijahakuQuery(criteria, { skip });

    useEffect(() => {
        setCriteria(state);
    }, [state]);

    const setQuery = (query: string) => {
        if (query !== criteria.query) {
            setState({ ...criteria, query, page: 0 });
        }
    };

    return (
        <OphDsPage header={L['OPPIJAHAKU']!}>
            {L['OPPIJAHAKU_SELITE'] && <p>{L['OPPIJAHAKU_SELITE']}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <DebouncedNameQuery onChange={setQuery} defaultValue={criteria.query} />
                <div>
                    <OphDsChechbox
                        id="passive"
                        checked={!!criteria.passive}
                        label={L['HENKILO_NAYTA_PASSIIVISET_TEKSTI']!}
                        onChange={() => setState({ ...criteria, passive: !criteria.passive, page: 0 })}
                    />
                </div>
            </div>
            <OphDsTable
                headers={[L['HENKILO_NIMI']!, L['HENKILO_SYNTYMAAIKA']!]}
                isFetching={isFetching}
                rows={(data?.content ?? []).map((d) => [
                    <Link key={`nimi-${d.oid}`} to={`/oppija/${d.oid}`} className="oph-ds-link">
                        {`${d.sukunimi}, ${d.etunimet}`}
                    </Link>,
                    <span key={`syntymaaika-${d.oid}`}>
                        {d.syntymaaika ? format(parseISO(d.syntymaaika), 'dd.MM.yyyy') : ''}
                    </span>,
                ])}
                rowDescriptionPartitive={L['OPPIJAA']}
                page={data?.page ? { page: data.page, setPage: (page) => setState({ ...criteria, page }) } : undefined}
            />
        </OphDsPage>
    );
};
