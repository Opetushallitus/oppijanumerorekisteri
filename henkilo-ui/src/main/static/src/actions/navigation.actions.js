// @flow
import {UPDATE_NAVIGATION} from "./actiontypes";
import type {NaviOptions, NaviTab} from "../types/navigation.type";
import {
    emptyNavi,
    mainNavigation,
    oppijaNavi,
    palvelukayttajaNavigation
} from "../components/navigation/navigationconfigurations";
import {henkiloViewTabs} from "../components/navigation/NavigationTabs";
import type {HenkiloState} from "../reducers/henkilo.reducer";

export const ophLightGray = '#f6f4f0';

export type Navigation = {
    type: string,
    naviTabs: Array<NaviTab>,
    naviOptions: NaviOptions
}

const updateNavigation = (naviTabs: Array<NaviTab>, naviOptions: NaviOptions) => ({
    type: UPDATE_NAVIGATION,
    naviTabs,
    naviOptions,
});

export const updateDefaultNavigation = () => updateNavigation(mainNavigation, {});

export const updatePalvelukayttajaNavigation = () => updateNavigation(palvelukayttajaNavigation, {});

// empty navi, authenticated page, backbutton
const updateBackbuttonEmptyNavigation = (backButton: boolean) => updateNavigation(emptyNavi, {
    backButton,
});

export const updateHenkiloNavigation = (oidHenkilo: string, henkiloState: HenkiloState, henkiloType: string) => updateNavigation(henkiloViewTabs(oidHenkilo, henkiloState, henkiloType), {
    backButton: true,
});

export const updateOppijaNavigation = (oidHenkilo: string) => updateNavigation(oppijaNavi(oidHenkilo), {
    backButton: true,
});

export const updateKayttooikeusryhmaNavigation = () => updateBackbuttonEmptyNavigation(true);
