import { convertToCSV, createCSV, exportReport } from './exportUtil';

const translate = (x: string) => x;

describe('convertToCSV', () => {
    test.each([
        ['Handles empty input', [], [], []],
        ['Handles empty data', [], [{ key: 'label' }], []],
        ['Handles empty columns', [{ key: 'label' }], [], [{}]],
        ['Maps data to correct columns', [{ key: 'value' }], [{ key: 'key', label: 'label' }], [{ label: 'value' }]],
        [
            'Ignored unwanted values',
            [{ key: 'value', foo: 'bar' }],
            [{ key: 'key', label: 'label' }],
            [{ label: 'value' }],
        ],
        ['Non-existing values are undefined', [{}], [{ key: 'key', label: 'label' }], [{ label: undefined }]],
    ])('%s', (_, data, columns, expected) => expect(convertToCSV(data, columns, translate)).toEqual(expected));
});

describe('createCSV', () => {
    test.each([
        ['Handles empty input', [], []],
        ['Handles empty data', [], [{ key: 'key', label: 'label' }]],
        ['Handles data row', [{ key: 'datarow' }], [{ key: 'key', label: 'label' }]],
        ['Handles multiple data rows', [{ key: 'datarow1' }, { key: 'datarow2' }], [{ key: 'key', label: 'label' }]],
        [
            'Handles multiple columns',
            [{ key1: 'item1', key2: 'item1' }],
            [
                { key: 'key1', label: 'label1' },
                { key: 'key2', label: 'label2' },
            ],
        ],
    ])('%s', (_, data, columns) => expect(createCSV(data, columns, translate)).toMatchSnapshot());
});

describe('exportReport', () => {
    window.URL.createObjectURL = jest.fn();

    afterAll(() => {
        jest.resetAllMocks();
    });

    test('Creates a link and appends it to the document', () => {
        exportReport([], [], translate);
        expect(document.body.lastChild).toMatchSnapshot();
    });
});
