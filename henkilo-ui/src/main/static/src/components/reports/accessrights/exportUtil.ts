import { unparse } from 'papaparse';
import moment from 'moment';

import PropertySingleton from '../../../globals/PropertySingleton';
import { AccessRightsReportRow } from '../../../reducers/report.reducer';
import { Localisations } from '../../../types/localisation.type';

const BOM = '\ufeff';
const DELIMITER = ';';

const formatDate = (date: string) => moment(date).format(PropertySingleton.state.PVM_MOMENT_FORMAATTI);

export const createCSV = (data: AccessRightsReportRow[], L: Localisations) =>
    unparse(
        {
            data: data.map((row) => ({
                [L['HENKILO_NIMI']]: row.personName,
                [L['HENKILO_OPPIJANUMERO']]: row.personOid,
                [L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA']]: row.organisationName,
                [L['OID']]: row.organisationOid,
                [L['HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS']]: row.accessRightName,
                [L['HENKILO_KAYTTOOIKEUS_ALKUPVM']]: row.startDate && formatDate(row.startDate),
                [L['HENKILO_KAYTTOOIKEUS_LOPPUPVM']]: row.endDate && formatDate(row.endDate),
            })),
            fields: [
                L['HENKILO_NIMI'],
                L['HENKILO_OPPIJANUMERO'],
                L['HENKILO_KAYTTOOIKEUS_ORGANISAATIO_TEHTAVA'],
                L['OID'],
                L['HENKILO_KAYTTOOIKEUS_KAYTTOOIKEUS'],
                L['HENKILO_KAYTTOOIKEUS_ALKUPVM'],
                L['HENKILO_KAYTTOOIKEUS_LOPPUPVM'],
            ],
        },
        {
            delimiter: DELIMITER,
        }
    );

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

export const exportReport = (data: AccessRightsReportRow[], L: Localisations) => downloadCSV(createCSV(data, L));

export default exportReport;
