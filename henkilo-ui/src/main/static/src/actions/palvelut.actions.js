// @flow
import {FETCH_PALVELUT_REQUEST, FETCH_PALVELUT_SUCCESS, FETCH_PALVELUT_FAILURE} from "./actiontypes";
import { http } from '../http';
import {urls} from 'oph-urls-js';
import type {Palvelu} from "../types/domain/kayttooikeus/palvelu.types";

type PalvelutRequestAction = { type: FETCH_PALVELUT_REQUEST };
type PalvelutSuccessAction = { type: FETCH_PALVELUT_SUCCESS, payload: Array<Palvelu> };
type PalvelutFailureAction = { type: FETCH_PALVELUT_FAILURE, error: any };

export type PalvelutAction = {
    type: FETCH_PALVELUT_REQUEST | FETCH_PALVELUT_SUCCESS | FETCH_PALVELUT_FAILURE;
    payload?: Array<Palvelu>,
    error?: any
};

const requestPalvelut = (): PalvelutRequestAction => ({ type: FETCH_PALVELUT_REQUEST });
const requestPalvelutSuccess = ( payload: Array<Palvelu> ): PalvelutSuccessAction => ({ type: FETCH_PALVELUT_SUCCESS, payload });
const requestPalvelutFailure = ( error ): PalvelutFailureAction => ({ type: FETCH_PALVELUT_FAILURE, error });
export const fetchAllPalvelut = () => async (dispatch: any) => {
    dispatch(requestPalvelut());
    const url = urls.url('kayttooikeus-service.palvelu.listaus');
    try {
        const data = await http.get(url);
        dispatch(requestPalvelutSuccess(data));
    } catch (error) {
        dispatch(requestPalvelutFailure(error));
        throw error;
    }
};