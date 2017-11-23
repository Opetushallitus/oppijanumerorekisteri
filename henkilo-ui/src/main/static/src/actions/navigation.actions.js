// @flow
import {UPDATE_NAVIGATION} from "./actiontypes";
import type {NaviTab} from "../types/navigation.type";
import {emptyNavi} from "../components/navigation/navigationconfigurations";

export const updateNavigation = (naviTabs: Array<NaviTab>, backLocation: ?string, bgColor: ?string) => ({type: UPDATE_NAVIGATION, naviTabs, backLocation, bgColor});

export const updateHenkiloNavigation = (naviTabs: Array<NaviTab>) => updateNavigation(naviTabs, '/henkilohaku');

export const updateEmptyNavigation = () => updateNavigation(emptyNavi, '');
