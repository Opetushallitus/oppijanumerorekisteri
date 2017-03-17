import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {increment, decrement, fetchFrontProperties, fetchL10n} from '../actions/actions';
import TopNavigation from '../components/TopNavigation'

const App = React.createClass({
    render: function() {
        return (
            this.props.frontProperties.initialized && this.props.l10n.initialized
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
        this.props.fetchL10n();
    },
    propTypes: {
        // Injected by React Redux
        pathname: PropTypes.string.isRequired,
        testCounter: PropTypes.number,

        increment: PropTypes.func,
        decrement: PropTypes.func,

        // Injected by React Router
        children: PropTypes.node,

        frontProperties: PropTypes.shape({
            initialized: React.PropTypes.bool,
            properties: React.array,
        }),

    }
});

const mapStateToProps = (state, ownProps) => {
    return {
        pathname: ownProps.location.pathname.substring(1),
        testCounter: state.testCounter,
        frontProperties: state.frontProperties,
        l10n: state.l10n,
    };
};

export default connect(mapStateToProps, {increment, decrement, fetchFrontProperties, fetchL10n})(App)
