import {UPDATE_NAVIGATION} from "./actiontypes";

export const updateNavigation = (naviTabs, backLocation) => ({type: UPDATE_NAVIGATION, naviTabs: naviTabs, backLocation: backLocation});

export const updateHenkiloNavigation = naviTabs => updateNavigation(naviTabs, '/henkilohaku');

