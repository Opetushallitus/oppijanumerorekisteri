import React, { useEffect, useMemo, useRef, useState } from 'react';
import Select, { SelectInstance } from 'react-select';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Link } from 'react-router';
import { format, parseISO } from 'date-fns';

import exportReport from './exportUtil';
import { useLocalisations } from '../../../selectors';
import { useGetAccessRightReportQuery } from '../../../api/kayttooikeus';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';
import { mainNavigation } from '../../navigation/navigationconfigurations';
import { OphDsPage } from '../../design-system/OphDsPage';
import { SelectOption, selectStyles } from '../../../utilities/select';
import { OphDsOrganisaatioSelect } from '../../design-system/OphDsOrganisaatioSelect';
import { OphDsTable, PageProps, SortOrder } from '../../design-system/OphDsTable';

const formatDate = (d: string) => format(parseISO(d), 'd.M.yyyy');

export const Kayttooikeusraportti = () => {
    const [oid, setOid] = useState<string | undefined>(undefined);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [sortOrder, setSortOrder] = useState<SortOrder>();
    const [page, setPage] = useState<number>(0);
    const [paging, setPaging] = useState<PageProps>();
    const [ryhmaOptions, setRyhmaOptions] = useState<SelectOption[]>([]);
    const ref = useRef<SelectInstance>(null);
    const { L } = useLocalisations();
    useTitle(L('KAYTTOOIKEUSRAPORTTI_TITLE'));
    useNavigation(mainNavigation, false);
    const { data, isFetching } = useGetAccessRightReportQuery(oid ?? skipToken);

    useEffect(() => {
        setFilter(undefined);
        setRyhmaOptions(
            [...new Set(data?.map((row) => row.accessRightName))].map((name) => ({ label: name, value: name }))
        );
    }, [data]);

    const report = useMemo(() => {
        const filteredData = data?.filter((row) => !filter || row.accessRightName === filter);
        if (sortOrder) {
            const { sortBy, asc } = sortOrder;
            switch (sortBy) {
                case L('HENKILO_NIMI'):
                    filteredData?.sort((a, b) =>
                        asc
                            ? (a.personName ?? '').localeCompare(b.personName ?? '')
                            : (b.personName ?? '').localeCompare(a.personName ?? '')
                    );
                    break;
                case L('HENKILO_OPPIJANUMERO'):
                    filteredData?.sort((a, b) =>
                        asc ? a.personOid.localeCompare(b.personOid) : b.personOid.localeCompare(a.personOid)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA'):
                    filteredData?.sort((a, b) =>
                        asc
                            ? a.organisationName.localeCompare(b.organisationName)
                            : b.organisationName.localeCompare(a.organisationName)
                    );
                    break;
                case L('OID'):
                    filteredData?.sort((a, b) =>
                        asc
                            ? a.organisationOid.localeCompare(b.organisationOid)
                            : b.organisationOid.localeCompare(a.organisationOid)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'):
                    filteredData?.sort((a, b) =>
                        asc
                            ? a.accessRightName.localeCompare(b.accessRightName)
                            : b.accessRightName.localeCompare(a.accessRightName)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_ALKUPVM'):
                    filteredData?.sort((a, b) =>
                        asc ? a.startDate.localeCompare(b.startDate) : b.startDate.localeCompare(a.startDate)
                    );
                    break;
                case L('HENKILO_KAYTTOOIKEUS_LOPPUPVM'):
                    filteredData?.sort((a, b) =>
                        asc ? a.endDate.localeCompare(b.endDate) : b.endDate.localeCompare(a.endDate)
                    );
                    break;
            }
        }
        if (filteredData && filteredData.length > 1000) {
            setPaging({
                page: {
                    number: page,
                    size: 100,
                    totalElements: filteredData.length,
                    totalPages: Math.ceil(filteredData.length / 100),
                },
                setPage,
            });
            return filteredData.slice(page * 100, (page + 1) * 100);
        } else {
            setPage(0);
            setPaging(undefined);
            return filteredData;
        }
    }, [data, sortOrder, filter, page]);
    const dataExport = () => exportReport(report ?? [], L);

    return (
        <OphDsPage header={L('KAYTTOOIKEUSRAPORTTI_TITLE')}>
            <div style={{ maxWidth: '700px' }}>
                <OphDsOrganisaatioSelect
                    label={L('HAETTU_KAYTTOOIKEUSRYHMA_HAKU_ORGANISAATIO')}
                    onChange={(o) => {
                        setOid(o?.oid);
                        ref.current?.clearValue();
                    }}
                />
            </div>
            {oid && ryhmaOptions.length > 0 && (
                <>
                    <div style={{ maxWidth: '700px' }}>
                        <Select
                            {...selectStyles}
                            ref={ref}
                            options={ryhmaOptions}
                            placeholder={L('HENKILOHAKU_FILTERS_KAYTTOOIKEUSRYHMA_PLACEHOLDER')}
                            value={ryhmaOptions.find((o) => o.value === filter)}
                            onChange={(option) => setFilter((option as SelectOption)?.value)}
                            isClearable
                        />
                    </div>
                    <div>
                        <button className="oph-ds-button" onClick={dataExport}>
                            {L('KAYTTOOIKEUSRAPORTTI_EXPORT')}
                        </button>
                    </div>
                </>
            )}
            {oid && (
                <OphDsTable
                    headers={[
                        L('HENKILO_NIMI'),
                        L('HENKILO_OPPIJANUMERO'),
                        L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA'),
                        L('OID'),
                        L('HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'),
                        L('HENKILO_KAYTTOOIKEUS_ALKUPVM'),
                        L('HENKILO_KAYTTOOIKEUS_LOPPUPVM'),
                    ]}
                    page={paging}
                    sortOrder={sortOrder}
                    setSortOrder={setSortOrder}
                    isFetching={isFetching}
                    rows={(report ?? []).map((d) => [
                        <span key={`name-${d.personOid}`}>{d.personName}</span>,
                        <Link key={`link-${d.personOid}`} to={`/virkailija/${d.personOid}`} target="_blank">
                            {d.personOid}
                        </Link>,
                        <span key={`org-${d.personOid}`}>{d.organisationName}</span>,
                        <span key={`orgoid-${d.personOid}`}>{d.organisationOid}</span>,
                        <span key={`acc-${d.personOid}`}>{d.accessRightName}</span>,
                        <div key={`start-${d.personOid}`} className="right">
                            {formatDate(d.startDate)}
                        </div>,
                        <div key={`end-${d.personOid}`} className="right">
                            {formatDate(d.endDate)}
                        </div>,
                    ])}
                    rowDescriptionPartitive={L('VIRKAILIJAA')}
                />
            )}
        </OphDsPage>
    );
};
