import React from 'react';
import type { AccessRightsReportRow } from '../../../reducers/report.reducer';

type Props = {
    reportData: AccessRightsReportRow[];
};

const AccessRightsReportData: React.FC<Props> = ({ reportData }) => (
    <div className="flex-horizontal">
        <pre>{JSON.stringify(reportData, null, 4)}</pre>
    </div>
);

export default AccessRightsReportData;
