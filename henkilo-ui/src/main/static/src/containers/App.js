// @flow
import * as React from 'react';
import {connect} from 'react-redux';
import {fetchFrontProperties} from '../actions/frontProperties.actions';
import TopNavigation from '../components/navigation/TopNavigation'
import Loader from "../components/common/icons/Loader";
import moment from 'moment';
import 'moment/locale/fi';
import 'moment/locale/sv';
import {fetchPrequels} from "../actions/prequel.actions";
import PropertySingleton from "../globals/PropertySingleton";
import {addGlobalNotification, removeGlobalNotification} from "../actions/notification.actions";
import { GlobalNotifications } from "../components/common/Notification/GlobalNotifications";
import type {LocalisationState} from "../reducers/l10n.reducer";
import {ophLightGray} from "../components/navigation/navigation.utils";
import type {Locale} from "../types/locale.type";
import background from '../img/unauthenticated_background.jpg';
import type {RouteType} from "../routes";
import {NOTIFICATIONTYPES} from "../components/common/Notification/notificationtypes";
import type {GlobalNotificationConfig} from "../types/notification.types";
import type {Localisations} from '../types/localisation.type'

type OwnProps = {
    children: React.Node,
    location: any,
    routes: Array<RouteType>,
    params: {[string]: string},
}

type AppProps = {
    ...OwnProps,
    frontProperties: {
        initialized: boolean,
        properties: Array<any>,
    },
    l10n: LocalisationState,
    locale: Locale,
    pathName: string,
    notificationList: Array<GlobalNotificationConfig>,
    removeGlobalNotification: (key: string) => void,
    omattiedotLoaded: boolean,
    prequelsNotLoadedCount: number,
    fetchFrontProperties: () => void,
    fetchPrequels: () => void,
    addGlobalNotification: (GlobalNotificationConfig) => void,
}

type AppState = {
    lastPath: ?string,
    route: RouteType,
    lastLocale: ?string,
}

const fetchPrequelsIntervalInMillis = 30 * 1000;

class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);

        this.state = {
            lastPath: null,
            route: props.routes[props.routes.length - 1],
            lastLocale: null,
        }
    }

    render() {
        if (this.isInitialized()) {
            moment.locale(this.props.locale);
            // flow-typed fails to generate this for some reason
            (moment: any).defaultFormat = PropertySingleton.getState().PVM_FORMAATTI;
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
        const L = props.l10n.localisations[props.locale];
        this.setTitle(L, route);
        this.warnOnUnsupportedLocale(L, props.locale);
    }

    setBackGround = function (route: RouteType) {
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
            window.document.body.bgColor = ophLightGray;
        }
    };

    setTitle = function (L: Localisations, route: RouteType) {
        if (L) {
            // Change document title
            const title = L[route.title] || L['TITLE_DEFAULT'];
            if (title) {
                window.document.title = title;
            }
        }
    };

    warnOnUnsupportedLocale(L: Localisations, locale: Locale) {
        if (!!L && !!locale && (!this.state.lastLocale || this.state.lastLocale !== locale)) {
            this.setState({lastLocale: locale}, () => {
                if (locale.toLowerCase() !== 'fi' && locale.toLowerCase() !== 'sv') {
                    this.props.addGlobalNotification({
                        key: 'EN_LOCALE_KEY',
                        type: NOTIFICATIONTYPES.WARNING,
                        title: L['HENKILO_YHTEISET_ASIOINTIKIELI_EN_VAROITUS']
                    });
                }
            });
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

export default connect<AppProps, OwnProps, _, _, _, _>(mapStateToProps, {fetchFrontProperties, fetchPrequels, removeGlobalNotification, addGlobalNotification })(App)
