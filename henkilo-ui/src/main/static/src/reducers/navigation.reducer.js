import {LOCATION_CHANGE, UPDATE_NAVIGATION} from "../actions/actiontypes";
import {mainNavigation} from "../configuration/navigationconfigurations";

export const naviState = (state = {naviTabs: [], backButton: null}, action) => {
    switch (action.type) {
        case UPDATE_NAVIGATION:
            // If component has updated navibar on mount
            document.body.bgColor = "#f6f4f0";
            return Object.assign({}, state, {naviTabs: action.naviTabs, backButton: action.backLocation});
        case LOCATION_CHANGE:
            // Default navigation always before component mounts
            document.body.bgColor = "white";
            return Object.assign({}, state, {naviTabs: mainNavigation, backButton: null});
        default:
            return state;
    }
};
