import {UPDATE_NAVIGATION} from "./actiontypes";

export const updateNavigation = (naviTabs, backLocation, bgColor) => ({type: UPDATE_NAVIGATION, naviTabs, backLocation, bgColor});

export const updateHenkiloNavigation = naviTabs => updateNavigation(naviTabs, '/henkilohaku');

