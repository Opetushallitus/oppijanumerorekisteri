import { unparse } from 'papaparse';
import moment from 'moment';
import PropertySingleton from '../../../globals/PropertySingleton';
import type { TableHeading } from '../../../types/react-table.types';

const BOM = '\ufeff';
const DELIMITER = ';';

const isDate = (value) => String(value).match(/^\d{4}-\d{2}-\d{2}/);

const formatDate = (date: Date) => moment(date).format(PropertySingleton.state.PVM_MOMENT_FORMAATTI);

const format: (any) => any = (value) => (isDate(value) ? formatDate(value) : value);

export const convertToCSV = (
    data: Record<string, any>[],
    columns: TableHeading[],
    translate: (string) => string
): Record<string, string>[] => {
    const fields: Record<string, string> = columns.reduce(
        (acc, curr) => ({
            ...acc,
            [curr.key]: curr.label,
        }),
        {}
    );
    return data.map((row) =>
        Object.entries(fields).reduce(
            (acc, [key, label]) => ({
                ...acc,
                [translate(label)]: format(row[key]),
            }),
            {}
        )
    );
};

export const createCSV = (
    data: Record<string, any>[],
    columns: TableHeading[],
    translate: (string) => string
): string =>
    unparse(
        {
            data: convertToCSV(data, columns, translate),
            fields: columns.map(({ label }) => translate(label)),
        },
        {
            delimiter: DELIMITER,
        }
    );

const createBlob: (csv: string) => Blob = (csv) => new Blob([`${BOM}${csv}`], { type: 'text/csv' });

const createAnchor: (Blob) => HTMLAnchorElement = (blob) => {
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

export const exportReport = (data: Record<string, any>[], columns: TableHeading[], translate: (string) => string) =>
    downloadCSV(createCSV(data, columns, translate));

export default exportReport;
