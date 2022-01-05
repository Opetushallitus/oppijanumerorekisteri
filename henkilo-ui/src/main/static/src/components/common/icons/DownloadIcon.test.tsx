import { shallow } from 'enzyme';
import DownloadIcon from './DownloadIcon';

describe('DownloadIcon', () => {
    test('Should render without crashing', () => {
        expect(shallow(<DownloadIcon />)).toMatchSnapshot();
    });
});
