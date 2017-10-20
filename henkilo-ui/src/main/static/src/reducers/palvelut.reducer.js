// @flow
import type {PalvelutAction} from "../actions/palvelut.actions";
import {FETCH_PALVELUT_FAILURE, FETCH_PALVELUT_REQUEST, FETCH_PALVELUT_SUCCESS} from "../actions/actiontypes";
import type {Palvelu} from '../types/domain/palvelu.types';

export type PalvelutState = {
    +palvelutLoading: boolean;
    +palvelut: Array<Palvelu>;
}

export const palvelutState = ( state: PalvelutState = { palvelutLoading: false, palvelut: [] }, action: PalvelutAction): PalvelutState => {
    switch(action.type) {
        case FETCH_PALVELUT_REQUEST:
            return { ...state, palvelutLoading: true };
        case FETCH_PALVELUT_SUCCESS:
            return { ...state, palvelutLoading: false, palvelut: action.payload };
        case FETCH_PALVELUT_FAILURE:
            return { ...state, palvelutLoading: false };
        default:
            return state;
    }
};