import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchFrontProperties} from '../actions/frontProperties.actions';
import TopNavigation from '../components/TopNavigation'
import Loader from "../components/common/icons/Loader";
import moment from 'moment'


class App extends React.Component {
    render() {
        if(this.isInitialized()) {
            moment.locale(this.props.locale);
            moment.defaultFormat = this.props.l10n.localisations[this.props.locale]['PVM_FORMAATTI'];
        }
        return (
            this.isInitialized()
                ?
                <div className="oph-typography mainContainer">
                    <TopNavigation tabs={this.props.naviTabs} pathName={this.props.pathname} backButton={this.props.backButton}
                                   l10n={this.props.l10n.localisations[this.props.locale]} />
                    <div>
                        {this.props.children}
                    </div>
                </div>
                : <Loader />
        );
    };

    isInitialized() {
        return this.props.frontProperties.initialized && this.props.l10n.l10nInitialized && this.props.l10n.localisationsInitialized
        && this.props.omattiedot !== undefined && this.props.prequelsNotLoadedCount === 0;
    }

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
        prequelsNotLoadedCount: state.prequels.notLoadedCount,
        locale: state.locale,
        omattiedot: state.omattiedot.data,
    };
};

export default connect(mapStateToProps, {fetchFrontProperties})(App)
