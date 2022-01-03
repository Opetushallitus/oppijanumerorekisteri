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

const tableDefinition: TableHeading[] = [
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
        Cell: (cellProps) => moment(cellProps.value).format(PropertySingleton.state.PVM_FORMAATTI),
    },
    {
        key: 'endDate',
        label: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
        maxWidth: 150,
        Cell: (cellProps) => moment(cellProps.value).format(PropertySingleton.state.PVM_FORMAATTI),
    },
    {
        key: 'modified',
        label: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
        maxWidth: 150,
        Cell: (cellProps) => moment(cellProps.value).format(PropertySingleton.state.PVM_FORMAATTI),
    },
    {
        key: 'modifiedBy',
        label: 'HENKILO_KAYTTOOIKEUS_KASITTELIJA',
    },
];

const AccessRightsReportData: React.FC<Props> = ({ report, translate }) => (
    <div className="reportScroll">
        <div className="reportWrapper">
            <Table
                getTdProps={() => ({ style: { textOverflow: 'unset' } })}
                headings={tableDefinition.map((column) => ({ ...column, label: translate(column.label) }))}
                data={report || []}
                noDataText={translate('HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA')}
            />
        </div>
    </div>
);

export default AccessRightsReportData;
