import React from 'react';
import {connect} from 'react-redux';
import {increment, decrement} from '../actions/actions';
import HenkiloPage from '../components/henkilo/HenkiloPage';

const HenkiloPageContainer = ({testCounter}) => {
    console.log(testCounter);
    return (<HenkiloPage></HenkiloPage>);
};

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1),
        testCounter: state.testCounter
    };
};

export default connect(mapStateToProps, {increment, decrement})(HenkiloPageContainer);