import { connect } from 'react-redux';
import { increment, decrement } from '../actions/actions';
import KutsuPage from '../components/kutsu/KutsuPage';

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1),
        testCounter: state.testCounter
    };
};

export default connect(mapStateToProps, {increment, decrement})(KutsuPage)