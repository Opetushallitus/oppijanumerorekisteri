import { shallow } from 'enzyme';
import AccessRightsReportControls from './AccessRightsReportControls';

describe('AccessRightsReportControls', () => {
    const MINIMAL_PROPS = {
        locale: '',
        L: {},
        organisations: [],
        disabled: false,
        filterValues: [],
        filter: undefined,
        setFilter: jest.fn(),
        setOid: jest.fn(),
    };

    test('renders without crashing', () => {
        expect(shallow(<AccessRightsReportControls {...MINIMAL_PROPS} />)).toMatchSnapshot();
    });

    test('invokes setOid callback in useEffect', () => {
        shallow(<AccessRightsReportControls {...MINIMAL_PROPS} />);
        expect(MINIMAL_PROPS.setOid).toHaveBeenCalledWith(undefined);
    });

    test('renders access rights filter if more than one access rights', () => {
        const component = shallow(<AccessRightsReportControls {...MINIMAL_PROPS} />);
        expect(component.find('Connect(OphSelect)')).toHaveLength(0);
        component.setProps({ ...MINIMAL_PROPS, filterValues: ['foo'] });
        expect(component.find('Connect(OphSelect)')).toHaveLength(0);
        component.setProps({ ...MINIMAL_PROPS, filterValues: ['foo', 'bar'] });
        expect(component.find('Connect(OphSelect)')).toHaveLength(1);
    });

    test('renders export button only if there is something to export', () => {
        const callback = jest.fn();
        const component = shallow(<AccessRightsReportControls {...MINIMAL_PROPS} />);
        expect(component.find('Button')).toHaveLength(0);
        component.setProps({ ...MINIMAL_PROPS, dataExport: callback });
        expect(component.find('Button')).toHaveLength(1);
    });
});
