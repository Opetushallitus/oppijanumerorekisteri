import React from 'react';
import { Link } from 'react-router';
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

export const formatDateTime: (string) => string = (value) =>
    moment(value).format(PropertySingleton.state.PVM_DATE_TIME_FORMAATTI);

export const columns: TableHeading[] = [
    {
        key: 'personName',
        label: 'HENKILO_NIMI',
        maxWidth: 300,
    },
    {
        key: 'personOid',
        label: 'HENKILO_OPPIJANUMERO',
        maxWidth: 250,
        Cell: (cellProps) => <Link to={`/virkailija/${cellProps.value}`}>{cellProps.value}</Link>,
    },
    {
        key: 'organisationName',
        label: 'HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA',
        maxWidth: 300,
    },
    {
        key: 'organisationOid',
        label: 'HENKILO_OID',
        maxWidth: 250,
    },
    {
        key: 'accessRightName',
        label: 'HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS',
    },
    {
        key: 'startDate',
        label: 'HENKILO_KAYTTOOIKEUS_ALKUPVM',
        maxWidth: 120,
        Cell: (cellProps) => <div className="right">{formatDate(cellProps.value)}</div>,
    },
    {
        key: 'endDate',
        label: 'HENKILO_KAYTTOOIKEUS_LOPPUPVM',
        maxWidth: 135,
        Cell: (cellProps) => <div className="right">{formatDate(cellProps.value)}</div>,
    },
    {
        key: 'modified',
        label: 'OPPIJOIDEN_TUONTI_LUONTIAIKA',
        maxWidth: 165,
        Cell: (cellProps) => <div className="right">{formatDateTime(cellProps.value)}</div>,
    },
    {
        key: 'modifiedBy',
        label: 'VIRKAILIJAN_TIEDOT_OTSIKKO',
        maxWidth: 250,
        Cell: (cellProps) => <Link to={`/virkailija/${cellProps.value}`}>{cellProps.value}</Link>,
    },
];

export const AccessRightsReport: React.FC<Props> = ({ report, translate }) => (
    <div className="reportScroll">
        <div className="henkilohakuTableWrapper reportWrapper">
            <Table
                headings={columns.map((column) => ({ ...column, label: translate(column.label) }))}
                data={report || []}
                noDataText={translate('HENKILO_KAYTTOOIKEUS_VOIMASSAOLEVAT_TYHJA')}
                resizable
                striped
                highlight
            />
        </div>
    </div>
);

const AccessRightsReportWrapper: React.FC<Props> = (props) => (props.report ? <AccessRightsReport {...props} /> : null);

export default AccessRightsReportWrapper;
