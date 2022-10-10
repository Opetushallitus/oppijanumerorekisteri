import { shallow } from 'enzyme';
import AccessRightsReportData, { AccessRightsReport, formatDate } from './AccessRightsReportData';

// mock translation functionality
const translate = (x: string) => x;

describe('AccessRightsReportData', () => {
    test('Should not render anything when report is undefined', () => {
        expect(shallow(<AccessRightsReportData report={undefined} translate={translate} />)).toMatchInlineSnapshot(
            '""'
        );
    });

    test('Should render (empty) report without crashing', () => {
        expect(shallow(<AccessRightsReportData report={[]} translate={translate} />)).toMatchSnapshot();
    });
});

describe('AccessRightsReport', () => {
    test('Should render (empty) report without crashing', () => {
        expect(shallow(<AccessRightsReport report={[]} translate={translate} />)).toMatchSnapshot();
    });
});

describe('formatDate', () => {
    test('format dates correctly', () => {
        expect(formatDate('2022-01-05T16:20:00')).toEqual('5.1.2022');
    });
});
