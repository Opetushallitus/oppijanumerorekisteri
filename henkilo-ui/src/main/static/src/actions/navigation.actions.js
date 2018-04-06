// @flow
import {UPDATE_NAVIGATION} from "./actiontypes";
import type {NaviOptions, NaviTab} from "../types/navigation.type";
import {emptyNavi, mainNavigation, palvelukayttajaNavigation} from "../components/navigation/navigationconfigurations";
import background from '../img/unauthenticated_background.jpg';

export type Navigation = {
    type: string,
    naviTabs: Array<NaviTab>,
    naviOptions: NaviOptions
}

export const updateNavigation = (naviTabs: Array<NaviTab>, naviOptions: NaviOptions) => ({
    type: UPDATE_NAVIGATION,
    naviTabs,
    naviOptions,
});

export const updateDefaultNavigation = () => updateNavigation(mainNavigation, {
    isUnauthenticatedPage: false,
    bgColor: '#f6f4f0',
    backButton: null,
});

export const updatePalvelukayttajaNavigation = () => updateNavigation(palvelukayttajaNavigation, {
    isUnauthenticatedPage: false,
    bgColor: '#f6f4f0',
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

export const updateUnauthenticatedNavigation: any = () => updateNavigation(emptyNavi, {
    bgColor: background,
    isUnauthenticatedPage: true,
});
