import { FETCH_PALVELUT_REQUEST, FETCH_PALVELUT_SUCCESS, FETCH_PALVELUT_FAILURE } from './actiontypes';
import { http } from '../http';
import { urls } from 'oph-urls-js';
import { Palvelu } from '../types/domain/kayttooikeus/palvelu.types';
import { AppDispatch } from '../store';

type PalvelutRequestAction = { type: string };
type PalvelutSuccessAction = { type: string; payload: Array<Palvelu> };
type PalvelutFailureAction = { type: string; error: unknown };

export type PalvelutAction = {
    type: string;
    payload?: Array<Palvelu>;
    error?: unknown;
};

const requestPalvelut = (): PalvelutRequestAction => ({
    type: FETCH_PALVELUT_REQUEST,
});
const requestPalvelutSuccess = (payload: Palvelu[]): PalvelutSuccessAction => ({
    type: FETCH_PALVELUT_SUCCESS,
    payload,
});
const requestPalvelutFailure = (error): PalvelutFailureAction => ({
    type: FETCH_PALVELUT_FAILURE,
    error,
});
export const fetchAllPalvelut = () => async (dispatch: AppDispatch) => {
    dispatch(requestPalvelut());
    const url = urls.url('kayttooikeus-service.palvelu.listaus');
    try {
        const data = await http.get<Palvelu[]>(url);
        dispatch(requestPalvelutSuccess(data));
    } catch (error) {
        dispatch(requestPalvelutFailure(error));
        throw error;
    }
};
