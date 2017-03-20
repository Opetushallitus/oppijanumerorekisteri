import {connect} from 'react-redux';
import HenkiloPage from '../components/henkilo/HenkiloPage';

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1)
    };
};

// const mapDispatchToProps = (dispatch) => {
//     return {
//         onChange: (newCount) => {
//             dispatch(change(newCount.nativeEvent.target.value))
//         }
//     }
// };

export default connect(mapStateToProps)(HenkiloPage);
