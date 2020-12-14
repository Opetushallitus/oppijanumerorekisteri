import {
    FETCH_PALVELUT_REQUEST,
    FETCH_PALVELUT_SUCCESS,
    FETCH_PALVELUT_FAILURE,
} from "./actiontypes"
import {http} from "../http"
import {urls} from "oph-urls-js"
import {Palvelu} from "../types/domain/kayttooikeus/palvelu.types"
import {Dispatch} from "../types/dispatch.type"

type PalvelutRequestAction = {type: string}
type PalvelutSuccessAction = {type: string; payload: Array<Palvelu>}
type PalvelutFailureAction = {type: string; error: any}

export type PalvelutAction = {
    type: string
    payload?: Array<Palvelu>
    error?: any
}

const requestPalvelut = (): PalvelutRequestAction => ({
    type: FETCH_PALVELUT_REQUEST,
})
const requestPalvelutSuccess = (
    payload: Array<Palvelu>,
): PalvelutSuccessAction => ({type: FETCH_PALVELUT_SUCCESS, payload})
const requestPalvelutFailure = (error): PalvelutFailureAction => ({
    type: FETCH_PALVELUT_FAILURE,
    error,
})
export const fetchAllPalvelut = () => async (dispatch: Dispatch) => {
    dispatch(requestPalvelut())
    const url = urls.url("kayttooikeus-service.palvelu.listaus")
    try {
        const data = await http.get(url)
        dispatch(requestPalvelutSuccess(data))
    } catch (error) {
        dispatch(requestPalvelutFailure(error))
        throw error
    }
}