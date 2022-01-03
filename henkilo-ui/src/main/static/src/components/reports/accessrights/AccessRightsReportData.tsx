import React from 'react';
import type { AccessRightsReportRow } from '../../../reducers/report.reducer';
import type { TableHeading } from '../../../types/react-table.types';
import moment from 'moment';
import Table from '../../common/table/Table';
import PropertySingleton from '../../../globals/PropertySingleton';
import './AccessRightsReportData.css';

type Props = {
    translate: (string) => string;
    report: AccessRightsReportRow[];
};

export const formatDate: (string) => string = (value) => moment(value).format(PropertySingleton.state.PVM_FORMAATTI);

export const columns: TableHeading[] = [
    {
        key: 'personName',
        label: 'HENKILO_NIMI',
    },
    {
        key: 'personOid',
        label: 'HENKILO_OPPIJANUMERO',
    },
    {
        key: 'organisationName',
        label: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA',
    },
    {
        key: 'organisationOid',
        label: 'HENKILO_OID',
    },
    {
        key: 'accessRightName',
        label: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
    },
    {
        key: 'startDate',
        label: 'HENKILO_KAYTTOOIKEUS_ALKUPVM',
        maxWidth: 150,
        Cell: (cellProps) => formatDate(cellProps.value),
    },
    {
        key: 'endDate',
        label: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
        maxWidth: 150,
        Cell: (cellProps) => formatDate(cellProps.value),
    },
    {
        key: 'modified',
        label: 'KAYTTOOIKEUSRAPORTTI_COLUMN_MODIFIED',
        maxWidth: 150,
        Cell: (cellProps) => formatDate(cellProps.value),
    },
    {
        key: 'modifiedBy',
        label: 'KAYTTOOIKEUSRAPORTTI_COLUMN_MODIFIER',
    },
];

const AccessRightsReportData: React.FC<Props> = ({ report, translate }) => (
    <div className="reportScroll">
        <div className="reportWrapper">
            <Table
                getTdProps={() => ({ style: { textOverflow: 'unset' } })}
                headings={columns.map((column) => ({ ...column, label: translate(column.label) }))}
                data={report || []}
                noDataText={translate('HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA')}
            />
        </div>
    </div>
);

export default AccessRightsReportData;
