import React from 'react';
import {connect} from 'react-redux';
import {fetchFrontProperties} from '../actions/frontProperties.actions';
import TopNavigation from '../components/navigation/TopNavigation'
import Loader from "../components/common/icons/Loader";
import moment from 'moment'
import 'moment/locale/fi'
import 'moment/locale/sv'
import PropTypes from 'prop-types'
import {fetchPrequels} from "../actions/prequel.actions";
import PropertySingleton from "../globals/PropertySingleton";

const fetchPrequelsIntervalInMillis = 30 * 1000;

class App extends React.Component {
    render() {
        if (this.isInitialized()) {
            moment.locale(this.props.locale);
            moment.defaultFormat = PropertySingleton.state.PVM_FORMAATTI;
        }
        return (
            this.isInitialized()
                ?
                <div className="oph-typography mainContainer">
                    <TopNavigation pathName={this.props.pathName} />
                    <div className="mainContent">
                        {this.props.children}
                    </div>
                </div>
                : <Loader />
        );
    };

    isInitialized() {
        return this.props.frontProperties.initialized && this.props.l10n.localisationsInitialized
        && this.props.omattiedotLoaded && this.props.prequelsNotLoadedCount === 0;
    }

    componentDidMount() {
        this.props.fetchFrontProperties();
        setInterval(this.props.fetchPrequels, fetchPrequelsIntervalInMillis);
    }

    static propTypes = {
        // Injected by React Router
        children: PropTypes.node,

        frontProperties: PropTypes.shape({
            initialized: PropTypes.bool,
            properties: PropTypes.array,
        }).isRequired,
        l10n: PropTypes.shape({
            localisationsInitialized: PropTypes.bool,
        }).isRequired,
    };
}

const mapStateToProps = (state, ownProps) => {
    return {
        frontProperties: state.frontProperties,
        l10n: state.l10n,
        prequelsNotLoadedCount: state.prequels.notLoadedCount,
        locale: state.locale,
        omattiedotLoaded: state.omattiedot.initialized,
        pathName: ownProps.location.pathname,
    };
};

export default connect(mapStateToProps, {fetchFrontProperties, fetchPrequels})(App)
