import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchFrontProperties} from '../actions/actions';
import TopNavigation from '../components/TopNavigation'

const App = React.createClass({
    render: function() {
        return (
            this.props.frontProperties.initialized && this.props.l10n.l10nInitialized && this.props.l10n.localisationsInitialized
                ? <div>
                    <TopNavigation></TopNavigation>
                    <div className="wrapper">
                        {this.props.children}
                    </div>
                </div>
                : <div>Prefetching data...</div>
        )
    },
    componentDidMount: function() {
        this.props.fetchFrontProperties();
        // this.props.fetchL10n();
    },
    propTypes: {
        // Injected by React Redux
        pathname: PropTypes.string.isRequired,

        // Injected by React Router
        children: PropTypes.node,

        frontProperties: PropTypes.shape({
            initialized: React.PropTypes.bool,
            properties: React.array,
        }),
        l10n: PropTypes.shape({
            l10nInitialized: React.PropTypes.bool,
            localisationsInitialized: React.PropTypes.bool,
        }),

    }
});

const mapStateToProps = (state, ownProps) => {
    return {
        pathname: ownProps.location.pathname.substring(1),
        frontProperties: state.frontProperties,
        l10n: state.l10n,
    };
};

export default connect(mapStateToProps, {fetchFrontProperties})(App)
