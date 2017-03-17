import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {increment, decrement, fetchFrontProperties} from '../actions/actions';
import TopNavigation from '../components/TopNavigation'

const App = React.createClass({
    render: function() {
        return (
            this.props.initialized
                ? <div>
                    <TopNavigation></TopNavigation>
                    <div className="wrapper">
                        {this.props.children}
                    </div>
                    <button onClick={this.props.increment}>inc</button>
                    <button onClick={this.props.decrement}>dec</button>
                    <div>In app component: {this.props.testCounter}</div>
                </div>
                : <div>Prefetching data...</div>
        )
    },
    componentDidMount: function() {
        this.props.fetchFrontProperties();
    },
    propTypes: {
        // Injected by React Redux
        pathname: PropTypes.string.isRequired,
        testCounter: PropTypes.number,

        increment: PropTypes.func,
        decrement: PropTypes.func,

        // Injected by React Router
        children: PropTypes.node,

        initialized: PropTypes.bool,

    }
});

const mapStateToProps = (state, ownProps) => {
    return {
        pathname: ownProps.location.pathname.substring(1),
        testCounter: state.testCounter,
        initialized: state.frontProperties.initialized,
    };
};

export default connect(mapStateToProps, {increment, decrement, fetchFrontProperties})(App)
