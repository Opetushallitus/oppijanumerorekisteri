import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchFrontProperties} from '../actions/frontProperties.actions';
import TopNavigation from '../components/TopNavigation'
import AbstractViewContainer from "./henkilo/AbstractViewContainer";
import Loader from "../components/common/icons/Loader";


class App extends React.Component{
    render() {
        return (
            this.props.frontProperties.initialized && this.props.l10n.l10nInitialized && this.props.l10n.localisationsInitialized
                && this.props.notLoadedCount === 0
                ? <div className="oph-typography mainContainer">
                <TopNavigation tabs={this.props.naviTabs} pathName={this.props.pathname} backButton={this.props.backButton}
                               l10n={this.props.l10n.localisations[this.props.locale]} />
                <div>
                    {this.props.children}
                </div>
            </div>
                : <div><Loader /></div>
        )
    };

    componentDidMount() {
        this.props.fetchFrontProperties();
    };

    static propTypes = {
        // Injected by React Redux
        pathname: PropTypes.string.isRequired,

        // Injected by React Router
        children: PropTypes.node,

        frontProperties: PropTypes.shape({
            initialized: React.PropTypes.bool,
            properties: React.array,
        }).isRequired,
        l10n: PropTypes.shape({
            l10nInitialized: React.PropTypes.bool,
            localisationsInitialized: React.PropTypes.bool,
        }).isRequired,

    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        pathname: ownProps.location.pathname,
        frontProperties: state.frontProperties,
        l10n: state.l10n,
        naviTabs: state.naviState.naviTabs,
        backButton: state.naviState.backButton,
        notLoadedCount: state.prequels.notLoadedCount,
        locale: state.locale
    };
};

export default connect(mapStateToProps, {fetchFrontProperties})(App)
