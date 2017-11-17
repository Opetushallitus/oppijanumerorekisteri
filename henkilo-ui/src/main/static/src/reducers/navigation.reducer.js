// @flow
import {LOCATION_CHANGE, UPDATE_NAVIGATION} from "../actions/actiontypes";
import {mainNavigation} from "../components/navigation/navigationconfigurations";

type NaviTab = {
    path: string,
    label: string,
}

type State = {
    naviTabs: Array<NaviTab>,
    backButton: ?string,
}

type Action = {
    type: string,
    bgColor: string,
    naviTabs: Array<NaviTab>,
    backLocation: ?string,
    payload: any, // redux native
}

const locationChanges = (state, action) => state.naviTabs.map(naviTab => naviTab.path).indexOf(action.payload.pathname) === -1;

export const naviState = (state: State = {naviTabs: [], backButton: null,}, action: Action) => {
    switch (action.type) {
        case UPDATE_NAVIGATION:
            if (action.bgColor.endsWith('.jpg')) {
                window.document.body.style.backgroundImage = `url('${action.bgColor}')`;
                window.document.body.style.backgroundRepeat = 'no-repeat';
                window.document.body.style.backgroundSize = 'cover';
                window.document.body.style.backgroundAttachment = 'fixed';
                window.document.body.style.backgroundPosition = '0px 100px';
            }
            else {
                // If bgColor is not provided guess by if component has updated navibar on mount
                window.document.body.bgColor = action.bgColor
                    ? action.bgColor
                    : action.naviTabs.length
                        ? "#f6f4f0"
                        : "white";
            }
            return Object.assign({}, state, {naviTabs: action.naviTabs, backButton: action.backLocation});
        case LOCATION_CHANGE:
            // Default navigation always before component mounts (only if location changes)
            if (locationChanges(state, action)) {
                window.document.body.bgColor = "white";
                return Object.assign({}, state, {naviTabs: mainNavigation, backButton: null});
            }
            return state;
        default:
            return state;
    }
};
