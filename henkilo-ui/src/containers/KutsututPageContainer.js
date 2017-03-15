import React from 'react';
import {connect} from 'react-redux';
import {increment, decrement} from '../actions/actions';
import KutsututPage from '../components/kutsutut/KutsututPage';

const KutsututPageContainer = ({testCounter}) => (
    <KutsututPage kutsutut="['test', 'best', 'dest']"></KutsututPage>
);

const mapStateToProps = (state, ownProps) => {
    return {
        path: ownProps.location.pathname.substring(1),
        testCounter: state.testCounter
    };
};

export default connect(mapStateToProps, {increment, decrement})(KutsututPageContainer)
