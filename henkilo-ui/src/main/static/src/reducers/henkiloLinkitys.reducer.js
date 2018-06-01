// @flow
import {
    FETCH_HENKILO_LINKITYKSET_FAILURE,
    FETCH_HENKILO_LINKITYKSET_REQUEST,
    FETCH_HENKILO_LINKITYKSET_SUCCESS
} from "../actions/actiontypes";

export type HenkiloLinkitysState = {
    [string]: {
        henkiloVarmentajas: Array<string>,
        henkiloVarmennettavas: Array<string>,
    },
}

type HenkiloLinkitysAction = {
    type: string,
    oidHenkilo: string,
    linkityksetByOid: HenkiloLinkitysState,
}

export const linkitykset = (state: HenkiloLinkitysState = {}, action: HenkiloLinkitysAction) => {
    switch (action.type) {
        case FETCH_HENKILO_LINKITYKSET_REQUEST:
            return {...state, [action.oidHenkilo]: {}};
        case FETCH_HENKILO_LINKITYKSET_SUCCESS:
            return {...state, [action.oidHenkilo]: {...action.linkityksetByOid[action.oidHenkilo]}};
        case FETCH_HENKILO_LINKITYKSET_FAILURE:
            // Do not try again if request fails once
            return {...state, [action.oidHenkilo]: {}};
        default:
            return state;
    }
};
