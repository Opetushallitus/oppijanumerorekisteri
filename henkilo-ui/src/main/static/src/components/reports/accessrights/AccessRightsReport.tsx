import React, { useEffect, useMemo, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';

import Loader from '../../common/icons/Loader';
import Controls from './AccessRightsReportControls';
import Report from './AccessRightsReportData';
import exportReport from './exportUtil';
import { useLocalisations } from '../../../selectors';
import { useGetAccessRightReportQuery } from '../../../api/kayttooikeus';
import { useTitle } from '../../../useTitle';
import { useNavigation } from '../../../useNavigation';
import { mainNavigation } from '../../navigation/navigationconfigurations';

export const AccessRightsReport = () => {
    const [oid, setOid] = useState<string | undefined>(undefined);
    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [filterValues, setFilterValues] = useState<string[]>([]);
    const { L } = useLocalisations();
    useTitle(L('KAYTTOOIKEUSRAPORTTI_TITLE'));
    useNavigation(mainNavigation, false);
    const { data, isFetching } = useGetAccessRightReportQuery(oid ?? skipToken);

    useEffect(() => {
        setFilter(undefined);
        setFilterValues([...new Set(data?.map((row) => row.accessRightName))]);
    }, [data]);

    const report = useMemo(() => data?.filter((row) => !filter || row.accessRightName === filter), [data, filter]);

    return (
        <div className="mainContent wrapper">
            <div className="flex-horizontal">
                <span className="oph-h2 oph-bold henkilohaku-main-header">{L('KAYTTOOIKEUSRAPORTTI_TITLE')}</span>
            </div>
            <Controls
                disabled={isFetching}
                filterValues={filterValues}
                filter={filter}
                setFilter={setFilter}
                setOid={setOid}
                dataExport={oid && report?.length ? () => exportReport(report, L) : undefined}
            />
            {isFetching && <Loader />}
            {report && oid && <Report report={report} />}
        </div>
    );
};

export default AccessRightsReport;
