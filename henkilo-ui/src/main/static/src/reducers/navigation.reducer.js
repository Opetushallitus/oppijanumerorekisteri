// @flow
import {
    FETCH_HENKILO_ASIOINTIKIELI_SUCCESS, FETCH_LOCALISATIONS_SUCCESS, LOCATION_CHANGE, UPDATE_NAVIGATION
} from "../actions/actiontypes";
import {mainNavigation} from "../components/navigation/navigationconfigurations";
import type {NaviOptions, NaviTab} from "../types/navigation.type";
import type {L, L10n} from "../types/localisation.type";
import type {Locale} from "../types/locale.type";

type State = {
    naviTabs: Array<NaviTab>,
    naviOptions: NaviOptions,
    l10n: L10n,
    L: L,
    lastPathName: ?string,
}

type Action = {
    type: string,
    naviTabs: Array<NaviTab>,
    naviOptions: NaviOptions,
    payload: any, // redux native
    henkiloUiLocalisations: L10n,
    lang: Locale
}

const locationChanges = (state, action) => state.naviTabs.map(naviTab => naviTab.path).indexOf(action.payload.pathname) === -1;

const urlToTitle = {
    "anomukset": "TITLE_ANOMUKSET",
    "kutsutut": "TITLE_KUTSUTUT",
    "kutsulomake": "TITLE_KUTSULOMAKE",
    "henkilohaku": "TITLE_HENKILOHAKU",
    "omattiedot": "TITLE_OMAT_TIEDOT",
    "rekisteroidy": "TITLE_REKISTEROINTI",
    "oppijoidentuonti": "TITLE_OPPIJOIDENTUONTI",
    "kayttooikeusryhmat": "TITLE_KAYTTO_OIKEUSRYHMA",

    // Trickier cases
    "oppija": "TITLE_OPPIJA", // oppija/:oid
    "virkailija": "TITLE_VIRKAILIJA", // virkailija/:oid
    "admin": "TITLE_ADMIN", // admin/:oid
    "oppija/luonti": "TITLE_OPPIJA_LUONTI",
    "palvelukayttaja/luonti": "TITLE_PALVELUKAYTTAJIEN_LUONTI",
    "vtjvertailu": "TITLE_VTJ_VERTAILU", // :henkiloType/:oid/vtjvertailu
    "duplikaatit": "TITLE_DUPLIKAATTIHAKU", // :henkiloType/:oid/duplikaatit
    "vahvatunnistusinfo/virhe": "TITLE_VIRHESIVU", // vahvatunnistusinfo/virhe/:locale/:loginToken
    "vahvatunnistusinfo": "TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN", // vahvatunnistusinfo/:locale/:loginToken
};

const initialState = {
    naviTabs: [],
    naviOptions: {
        backButton: null,
        isUnauthenticatedPage: true,
        bgColor: null,
    },
    L: {},
    l10n: {
        fi: {},
        sv: {},
        en: {}
    },
    lastPathName: null,
};

export const naviState = (state: State = initialState , action: Action) => {
    switch (action.type) {
        case UPDATE_NAVIGATION:
            return onUpdateNavigation(state, action);
        case LOCATION_CHANGE:
            return onLocationChange(state, action);
        // These two are needed for localizing page titles
        // L10N is guaranteed to be called first. Check frontProperties.actions.js for more information.
        case FETCH_LOCALISATIONS_SUCCESS:
            return Object.assign({}, state, {l10n: action.henkiloUiLocalisations});
        case FETCH_HENKILO_ASIOINTIKIELI_SUCCESS:
            return Object.assign({}, state, {L: state.l10n[action.lang] || {}});
        default:
            return state;
    }
};

const onUpdateNavigation = (state: State, action: Action) => {
    if (action.naviOptions.bgColor && action.naviOptions.bgColor.endsWith('.jpg')) {
        window.document.body.style.backgroundImage = `url('${action.naviOptions.bgColor}')`;
        window.document.body.style.backgroundRepeat = 'no-repeat';
        window.document.body.style.backgroundSize = 'cover';
        window.document.body.style.backgroundAttachment = 'fixed';
        window.document.body.style.backgroundPosition = '0px 100px';
    }
    else {
        // If bgColor is not provided guess by if component has updated navibar on mount
        window.document.body.bgColor = action.naviOptions.bgColor
            ? action.naviOptions.bgColor
            : action.naviTabs.length
                ? "#f6f4f0"
                : "white";
    }
    return Object.assign({}, state, {
        naviTabs: action.naviTabs,
        naviOptions: {
            ...state.naviOptions,
            ...action.naviOptions,
        },
    });
};

const onLocationChange = (state: State, action: Action) => {
    // Change document title
    const pathname = getPathName(state, action.payload);
    const defaultTitle = state.L['TITLE_DEFAULT'];
    const title = pathname ? state.L[urlToTitle[pathname]] : undefined;

    if (defaultTitle || title) {
        window.document.title = title ? title : defaultTitle;
    }

    // Default navigation always before component mounts (only if location changes)
    if (action.payload && locationChanges(state, action)) {
        window.document.body.bgColor = "white";
        return Object.assign({}, state, {
            naviTabs: mainNavigation,
            naviOptions: {
                ...state.naviOptions,
                ...action.naviOptions,
                // deep pages are expected to be eather unauthorized or request their own navigation.
                isUnauthenticatedPage: action.payload.pathname.split('/').length > 2 || action.payload.pathname === '/rekisteroidy',
                backButton: null,
            },
            lastPathName: pathname,
        });
    }
    return Object.assign({}, state, {lastPathName: pathname});
};

const getPathName = (state, payload): ?string => {
    if (payload && payload.pathname) {
        const parts = payload.pathname.match(/[^/]+/g);
        if (!parts) return "";
        if (parts.length === 1) {
            return parts[0];
        } else {
            if (parts[1].startsWith("1.2")) {
                return parts[0];
            } else if (parts[1] === "luonti") {
                return parts[0] + "/" + parts[1];
            } else if (parts[0] === "vahvatunnistusinfo") {
                return parts[1] === "virhe" ? "vahvatunnistusinfo/virhe" : "vahvatunnistusinfo";
            } else if (parts[2] && (parts[2] === "vtjvertailu" || parts[2] === "duplikaatit")) {
                return parts[2];
            }
        }
    }
    return state.lastPathName;
};
