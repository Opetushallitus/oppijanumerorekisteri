// @flow
import {UPDATE_NAVIGATION} from "./actiontypes";
import type {NaviOptions, NaviTab} from "../types/navigation.type";
import {emptyNavi, mainNavigation} from "../components/navigation/navigationconfigurations";
import background from '../img/unauthenticated_background.jpg';

export const updateNavigation = (naviTabs: Array<NaviTab>, naviOptions: NaviOptions) => ({
    type: UPDATE_NAVIGATION,
    naviTabs,
    naviOptions,
});

export const updateDefaultNavigation = () => updateNavigation(mainNavigation, {
    isUnauthenticatedPage: false,
    bgColor: 'white',
    backButton: null,
});

// empty navi, authenticated page, backbutton
export const updateBackbuttonEmptyNavigation = (backButton: string) => updateNavigation(emptyNavi, {
    backButton,
    isUnauthenticatedPage: false,
});

export const updateHenkiloNavigation = (naviTabs: Array<NaviTab>) => updateNavigation(naviTabs, {
    backButton: '/henkilohaku',
    isUnauthenticatedPage: false,
});

export const updateKayttooikeusryhmaNavigation = () => updateBackbuttonEmptyNavigation('/kayttooikeusryhmat');

export const updateEmptyNavigation = () => updateNavigation(emptyNavi, {
    isUnauthenticatedPage: false,
});

export const updateUnauthenticatedNavigation = () => updateNavigation(emptyNavi, {
    bgColor: background,
    isUnauthenticatedPage: true,
});
