import { format, parseISO } from 'date-fns';

import { LocalisationFn } from '../../types/localisation.type';
import { KayttooikeusraporttiRow } from '../../api/kayttooikeus';

const BOM = '\ufeff';
const DELIMITER = ';';

const formatDate = (date: string) => format(parseISO(date), 'd.M.yyyy');

const escapeCSVValue = (value: unknown) => {
    const stringValue = value == null ? '' : String(value);
    const shouldQuote =
        stringValue.includes(DELIMITER) ||
        stringValue.includes('"') ||
        stringValue.includes('\n') ||
        stringValue.includes('\r');

    return shouldQuote ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
};

export const createCSV = (data: KayttooikeusraporttiRow[], L: LocalisationFn) => {
    const fields = [
        L('HENKILO_NIMI'),
        L('HENKILO_OPPIJANUMERO'),
        L('HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA'),
        L('OID'),
        L('HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'),
        L('HENKILO_KAYTTOOIKEUS_ALKUPVM'),
        L('HENKILO_KAYTTOOIKEUS_LOPPUPVM'),
    ];

    const rows = data.map((row) => [
        row.personName,
        row.personOid,
        row.organisationName,
        row.organisationOid,
        row.accessRightName,
        row.startDate && formatDate(row.startDate),
        row.endDate && formatDate(row.endDate),
    ]);

    return [fields, ...rows].map((row) => row.map(escapeCSVValue).join(DELIMITER)).join('\r\n');
};

const createBlob = (csv: string) => new Blob([`${BOM}${csv}`], { type: 'text/csv' });

const createAnchor: (Blob: Blob) => HTMLAnchorElement = (blob) => {
    const link = document.createElement('a');
    link.style.display = 'none';
    link.setAttribute('href', String(URL.createObjectURL(blob)));
    link.setAttribute('download', `report.csv`);
    return link;
};

export const downloadCSV = (csv: string) => {
    const link = createAnchor(createBlob(csv));
    document.body.appendChild(link);
    link.click();
};

export const exportReport = (data: KayttooikeusraporttiRow[], L: LocalisationFn) => downloadCSV(createCSV(data, L));

export default exportReport;
