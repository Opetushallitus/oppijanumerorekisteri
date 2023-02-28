import { AnyAction } from '@reduxjs/toolkit';
import { FETCH_HENKILO_ASIOINTIKIELI_SUCCESS } from '../actions/actiontypes';
import { Locale } from '../types/locale.type';

export const locale = (state: Locale = 'fi', action: AnyAction): Locale => {
    switch (action.type) {
        case FETCH_HENKILO_ASIOINTIKIELI_SUCCESS:
            return action.lang || state;
        default:
            return state;
    }
};
