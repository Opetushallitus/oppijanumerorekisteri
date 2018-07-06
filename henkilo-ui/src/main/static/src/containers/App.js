import React from 'react';
import {connect} from 'react-redux';
import {fetchFrontProperties} from '../actions/frontProperties.actions';
import TopNavigation from '../components/navigation/TopNavigation'
import Loader from "../components/common/icons/Loader";
import moment from 'moment'
import 'moment/locale/fi'
import 'moment/locale/sv'
import {fetchPrequels} from "../actions/prequel.actions";
import PropertySingleton from "../globals/PropertySingleton";
import {removeGlobalNotification} from "../actions/notification.actions";
import { GlobalNotifications } from "../components/common/Notification/GlobalNotifications";
import {LocalisationState} from "../reducers/l10n.reducer";
import {ophLightGray} from "../actions/navigation.actions";
import type {Locale} from "../types/locale.type";
import background from '../img/unauthenticated_background.jpg';

type AppProps = {
    children: React.Node,
    frontProperties: {
        initialized: boolean,
        properties: Array<any>,
    },
    l10n: LocalisationState,
    locale: Locale,
}

type AppState = {
    lastPath: string,
    route: any,
}

const fetchPrequelsIntervalInMillis = 30 * 1000;

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {

        }
    }

    render() {
        if (this.isInitialized()) {
            moment.locale(this.props.locale);
            moment.defaultFormat = PropertySingleton.state.PVM_FORMAATTI;
        }
        return (
            this.isInitialized()
                ?
                <div className="oph-typography mainContainer">
                    <GlobalNotifications notificationList={this.props.notificationList}
                                         removeGlobalNotification={this.props.removeGlobalNotification}/>
                    <TopNavigation pathName={this.props.pathName}
                                   route={this.state.route}
                                   params={this.props.params}
                    />
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

    componentWillReceiveProps(props: AppProps) {
        const route = props.routes[props.routes.length - 1];
        if (!this.state.lastPath || this.state.lastPath !== route.path) {
            this.setBackGround(route);
            this.setState({lastPath: props.pathName, route});
        }
        this.setTitle(props.l10n.localisations[props.locale], route);
    }

    setBackGround = function (route) {
        if (route.isUnauthenticated) {
            window.document.body.style.backgroundImage = `url('${background}')`;
            window.document.body.style.backgroundRepeat = 'no-repeat';
            window.document.body.style.backgroundSize = 'cover';
            window.document.body.style.backgroundAttachment = 'fixed';
            window.document.body.style.backgroundPosition = '0px 100px';
            window.document.body.bgColor = 'white';
        }
        else {
            // If bgColor is not provided guess by if component has updated navibar on mount
            window.document.body.bgColor = route.bgColor || ophLightGray;
        }
    };

    setTitle = function (L, route) {
        if (L) {
            // Change document title
            const title = L[route.title] || L['TITLE_DEFAULT'];
            if (title) {
                window.document.title = title;
            }
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        frontProperties: state.frontProperties,
        l10n: state.l10n,
        prequelsNotLoadedCount: state.prequels.notLoadedCount,
        locale: state.locale,
        omattiedotLoaded: state.omattiedot.initialized,
        pathName: ownProps.location.pathname,
        notificationList: state.notificationList,
        routes: ownProps.routes,
        params: ownProps.params,
    };
};

export default connect(mapStateToProps, {fetchFrontProperties, fetchPrequels, removeGlobalNotification })(App)
