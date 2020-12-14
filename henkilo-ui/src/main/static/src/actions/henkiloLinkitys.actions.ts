import {http} from "../http"
import {urls} from "oph-urls-js"
import {Dispatch} from "../types/dispatch.type"
import {
    FETCH_HENKILO_LINKITYKSET_FAILURE,
    FETCH_HENKILO_LINKITYKSET_REQUEST,
    FETCH_HENKILO_LINKITYKSET_SUCCESS,
} from "./actiontypes"
import {HenkiloLinkitysState} from "../reducers/henkiloLinkitys.reducer"

type HenkiloLinkitysGetState = () => {
    linkitykset: HenkiloLinkitysState
}

const henkiloLinkitysRequest = oidHenkilo => ({
    type: FETCH_HENKILO_LINKITYKSET_REQUEST,
    oidHenkilo,
})
const henkiloLinkitysSuccess = (oidHenkilo, linkityksetByOid) => ({
    type: FETCH_HENKILO_LINKITYKSET_SUCCESS,
    linkityksetByOid,
    oidHenkilo,
})
const henkiloLinkitysFailure = oidHenkilo => ({
    type: FETCH_HENKILO_LINKITYKSET_FAILURE,
    oidHenkilo,
})

/**
 * Hakee henkilön varmentaja linkitykset käyttöoikeuspalvelusta. Ei yritä hakea uudestaan jos tiedot on jo haettu.
 * @param oidHenkilo
 * @returns {Function}
 */
export const fetchHenkiloLinkitykset = (oidHenkilo: string) => async (
    dispatch: Dispatch,
    getState: HenkiloLinkitysGetState,
) => {
    if (!getState().linkitykset[oidHenkilo]) {
        dispatch(henkiloLinkitysRequest(oidHenkilo))
        const url = urls.url(
            "kayttooikeus-service.henkilo.linkitykset",
            oidHenkilo,
        )
        try {
            const linkitykset = await http.get(url)
            dispatch(
                henkiloLinkitysSuccess(oidHenkilo, {[oidHenkilo]: linkitykset}),
            )
        } catch (error) {
            dispatch(henkiloLinkitysFailure(oidHenkilo))
            throw error
        }
    }
}