import React from 'react';
import {connect} from 'react-redux';
import {change} from '../actions/actions';
import HenkiloPage from '../components/henkilo/HenkiloPage';

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1),
        testCounter: state.testCounter
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: (newCount) => {
            dispatch(change(newCount.nativeEvent.target.value))
        }
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(HenkiloPage);
