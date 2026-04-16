import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';

import { useLocalisations } from '../../selectors';
import { OphDsPage } from '../design-system/OphDsPage';
import { OphDsChechbox } from '../design-system/OphDsCheckbox';
import { OphDsInput } from '../design-system/OphDsInput';
import { OphDsTable } from '../design-system/OphDsTable';
import { useTitle } from '../../useTitle';
import { useNavigation } from '../../useNavigation';
import { oppijaNavigation } from '../navigation/navigationconfigurations';
import { OppijahakuCriteria, usePostOppijahakuQuery } from '../../api/oppijanumerorekisteri';
import { RootState, useAppDispatch } from '../../store';
import { setState as _setState } from '../../slices/oppijahakuSlice';

import styles from './OppijahakuPage.module.css';
import { useGetOmattiedotQuery } from '../../api/kayttooikeus';
import { hasAnyPalveluRooli } from '../../utilities/palvelurooli.util';

export const OppijahakuPage = () => {
    const { L } = useLocalisations();
    const navigate = useNavigate();
    const { data: omattiedot } = useGetOmattiedotQuery();
    useTitle('Oppijahaku');
    useNavigation(oppijaNavigation);

    const state = useSelector<RootState, OppijahakuCriteria>((state) => state.oppijahaku);
    const setState = (newState: OppijahakuCriteria) => useAppDispatch()(_setState(newState));
    const [criteria, setCriteria] = useState<OppijahakuCriteria>(state);
    const skip = !criteria.query || criteria.query.length < 3;
    const { data, isFetching } = usePostOppijahakuQuery(criteria, { skip });

    useEffect(() => {
        if (!omattiedot) {
            return;
        }
        const isOnrRekisterinpitaja = hasAnyPalveluRooli(
            omattiedot.organisaatiot.filter((o) => o.organisaatioOid === '1.2.246.562.10.00000000001'),
            ['OPPIJANUMEROREKISTERI_REKISTERINPITAJA']
        );
        if (!isOnrRekisterinpitaja) {
            navigate('/oppijoidentuonti');
        }
    }, [omattiedot]);

    useEffect(() => {
        setCriteria(state);
    }, [state]);

    const setQuery = (query: string) => {
        if (query !== criteria.query) {
            setState({ ...criteria, query, page: 0 });
        }
    };

    return (
        <OphDsPage header={L('OPPIJAHAKU')}>
            {L('OPPIJAHAKU_SELITE') && <p>{L('OPPIJAHAKU_SELITE')}</p>}
            <div className={styles.oppijahakuInputs}>
                <OphDsInput
                    id="query"
                    label={L('OPPIJAHAKU_HAKUTERMI')}
                    placeholder={L('HAE')}
                    icon="search"
                    isClearable
                    onChange={setQuery}
                    defaultValue={criteria.query}
                    debounceTimeout={400}
                />
            </div>
            <div>
                <OphDsChechbox
                    id="passive"
                    checked={!!criteria.passive}
                    label={L('HENKILO_NAYTA_PASSIIVISET_TEKSTI')}
                    onChange={() => setState({ ...criteria, passive: !criteria.passive, page: 0 })}
                />
            </div>
            <OphDsTable
                headers={[L('HENKILO_NIMI'), L('HENKILO_SYNTYMAAIKA')]}
                placeholder={data ? undefined : L('HAE_OPPIJOITA')}
                isFetching={isFetching}
                rows={((!skip && data?.content) || []).map((d) => [
                    <Link key={`nimi-${d.oid}`} to={`/oppija/${d.oid}`} className="oph-ds-link">
                        {`${d.sukunimi}, ${d.etunimet}`}
                    </Link>,
                    <span key={`syntymaaika-${d.oid}`}>
                        {d.syntymaaika ? format(parseISO(d.syntymaaika), 'd.M.yyyy') : ''}
                    </span>,
                ])}
                rowDescriptionPartitive={L('OPPIJAA')}
                page={
                    !skip && data?.page
                        ? { page: data.page, setPage: (page) => setState({ ...criteria, page }) }
                        : undefined
                }
            />
        </OphDsPage>
    );
};
