import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {increment, decrement} from '../actions/actions';
import TopNavigation from '../components/TopNavigation'

const App = ({pathname, testCounter, children, increment, decrement}) => {
    return (
        <div>
            <TopNavigation></TopNavigation>
            <div className="wrapper">
                {children}
            </div>
            <button onClick={increment}>inc</button>
            <button onClick={decrement}>dec</button>
            <div>In app component: {testCounter}</div>
        </div>
    );
};

App.propTypes = {
    // Injected by React Redux
    pathname: PropTypes.string.isRequired,
    testCounter: PropTypes.number,

    increment: PropTypes.func,
    decrement: PropTypes.func,

    // Injected by React Router
    children: PropTypes.node
};

const mapStateToProps = (state, ownProps) => {
    return {
        pathname: ownProps.location.pathname.substring(1),
        testCounter: state.testCounter
    };
};

export default connect(mapStateToProps, {increment, decrement})(App)
