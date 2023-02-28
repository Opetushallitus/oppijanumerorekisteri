import React from 'react';
import { shallow } from 'enzyme';
import type { L10n } from '../../../types/localisation.type';
import { AccessRightsReport } from './AccessRightsReport';
import { Locale } from '../../../types/locale.type';

describe('AccessRightsReport', () => {
    const MINIMAL_PROPS = {
        l10n: {} as L10n,
        locale: 'fi' as Locale,
        reportLoading: false,
        reportData: undefined,
        fetchReport: jest.fn(),
        clearReport: jest.fn(),
    };

    afterEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    test('renders without crashing', () => {
        expect(shallow(<AccessRightsReport {...MINIMAL_PROPS} />)).toMatchSnapshot();
    });

    test('invokes fetchReport on oid change', () => {
        // @ts-ignore
        const spy = jest.spyOn(React, 'useState').mockImplementation((_) => ['test', jest.fn()]);
        expect(MINIMAL_PROPS.fetchReport).toHaveBeenCalledTimes(0);
        shallow(<AccessRightsReport {...MINIMAL_PROPS} />);
        expect(MINIMAL_PROPS.clearReport).toHaveBeenCalled();
        expect(MINIMAL_PROPS.fetchReport).toHaveBeenCalledWith('test');
        spy.mockRestore();
    });

    test('only show report if organization selected', () => {
        expect(shallow(<AccessRightsReport {...MINIMAL_PROPS} />).find('Loader')).toHaveLength(0);
    });

    test('show spinner while loading report', () => {
        // @ts-ignore
        const spy = jest.spyOn(React, 'useState').mockImplementation((_) => ['test', jest.fn()]);
        expect(
            shallow(<AccessRightsReport {...{ ...MINIMAL_PROPS, reportLoading: true }} />).find('Loader')
        ).toHaveLength(1);
        spy.mockRestore();
    });

    test('show report when report has been loaded for given oid', () => {
        // @ts-ignore
        const spy = jest.spyOn(React, 'useState').mockImplementation((_) => ['test', jest.fn()]);
        expect(
            shallow(<AccessRightsReport {...{ ...MINIMAL_PROPS, reportData: [] }} />).find('AccessRightsReportWrapper')
        ).toHaveLength(1);
        spy.mockRestore();
    });
});
