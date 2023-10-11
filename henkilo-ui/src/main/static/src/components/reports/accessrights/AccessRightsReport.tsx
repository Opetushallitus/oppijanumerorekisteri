import React, { useEffect, useMemo, useState } from 'react';

import Loader from '../../common/icons/Loader';
import Controls from './AccessRightsReportControls';
import Report from './AccessRightsReportData';
import exportReport from './exportUtil';
import { useLocalisations } from '../../../selectors';
import { useGetAccessRightReportQuery } from '../../../api/kayttooikeus';

export const AccessRightsReport = () => {
    const [oid, setOid] = useState<string>(undefined);
    const [filter, setFilter] = useState<string>(undefined);
    const [filterValues, setFilterValues] = useState<string[]>([]);
    const { L } = useLocalisations();
    const { data, isFetching } = useGetAccessRightReportQuery(oid, { skip: !oid });

    useEffect(() => {
        setFilter(undefined);
        setFilterValues([...new Set(data?.map((row) => row.accessRightName))]);
    }, [data]);

    const report = useMemo(() => data?.filter((row) => !filter || row.accessRightName === filter), [data, filter]);

    return (
        <div className="wrapper">
            <div className="flex-horizontal">
                <span className="oph-h2 oph-bold henkilohaku-main-header">{L['KAYTTOOIKEUSRAPORTTI_TITLE']}</span>
            </div>
            <Controls
                disabled={isFetching}
                filterValues={filterValues}
                filter={filter}
                setFilter={setFilter}
                setOid={setOid}
                dataExport={oid && report?.length && (() => exportReport(report, L))}
            />
            {isFetching && <Loader />}
            {report && oid && <Report report={report} />}
        </div>
    );
};

export default AccessRightsReport;
