import { AnyAction } from '@reduxjs/toolkit';
import {
    FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST,
    FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS,
} from '../actions/actiontypes';
import { Koodi, Koodisto } from '../types/domain/koodisto/koodisto.types';

export type KoodistoStateKoodi = {
    koodiUri: string;
    value: string;
    [kieli: string]: string;
};

const mapKoodistoValuesByLocale = (koodisto: Koodisto): KoodistoStateKoodi[] =>
    koodisto.map((koodi: Koodi) => ({
        koodiUri: koodi.koodiUri,
        value: koodi.koodiArvo.toLowerCase(),
        ...Object.fromEntries(koodi.metadata.map((k) => [k.kieli.toLowerCase(), k.nimi])),
    }));

export type KoodistoState = {
    yhteystietotyypitKoodistoLoading: boolean;
    yhteystietotyypit: Array<KoodistoStateKoodi>;
};

const koodisto = (
    state: Readonly<KoodistoState> = {
        yhteystietotyypitKoodistoLoading: true,
        yhteystietotyypit: [],
    },
    action: AnyAction
): KoodistoState => {
    switch (action.type) {
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_REQUEST:
            return { ...state, yhteystietotyypitKoodistoLoading: true };
        case FETCH_YHTEYSTIETOTYYPITKOODISTO_SUCCESS:
            return {
                ...state,
                yhteystietotyypitKoodistoLoading: false,
                yhteystietotyypit: mapKoodistoValuesByLocale(action.yhteystietotyypit),
            };
        default:
            return state;
    }
};

export default koodisto;
