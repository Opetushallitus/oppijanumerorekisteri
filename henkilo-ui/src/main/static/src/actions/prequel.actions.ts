import {FETCH_PREQUEL_REQUEST, FETCH_PREQUEL_SUCCESS} from "./actiontypes"
import {http} from "../http"
import {urls} from "oph-urls-js"
import {Dispatch} from "../types/dispatch.type"

const requestKayttooikeusPrequel = () => ({type: FETCH_PREQUEL_REQUEST})
const receivedKayttooikeusPrequel = () => ({type: FETCH_PREQUEL_SUCCESS})
const requestOppijanumerorekisteriPrequel = () => ({
    type: FETCH_PREQUEL_REQUEST,
})
const receiveOppijanumerorekisteriPrequel = json => ({
    type: FETCH_PREQUEL_SUCCESS,
    data: json,
})

export const fetchPrequels = () => async (dispatch: Dispatch) => {
    return Promise.all([
        fetchOppijanumerorekisteriPrequel(dispatch),
        fetchKayttooikeusPrequel(dispatch),
    ])
}

const fetchOppijanumerorekisteriPrequel = async (dispatch: Dispatch) => {
    dispatch(requestOppijanumerorekisteriPrequel())
    await http.get(urls.url("oppijanumerorekisteri-service.prequel"))
    dispatch(receiveOppijanumerorekisteriPrequel())
}

const fetchKayttooikeusPrequel = async (dispatch: Dispatch) => {
    dispatch(requestKayttooikeusPrequel())
    await http.get(urls.url("kayttooikeus-service.prequel"))
    dispatch(receivedKayttooikeusPrequel())
}