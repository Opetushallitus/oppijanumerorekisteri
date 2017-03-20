import { connect } from 'react-redux';
import KutsuPage from '../components/kutsu/KutsuPage';

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1)
    };
};

export default connect(mapStateToProps)(KutsuPage)