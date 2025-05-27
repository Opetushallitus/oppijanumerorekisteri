import type { AnyAction } from '@reduxjs/toolkit';
import { FETCH_HENKILO_ASIOINTIKIELI_SUCCESS } from '../actions/actiontypes';
import { Locale } from '../types/locale.type';

export function toSupportedLocale(anyLocale: string): Locale {
    const locale = anyLocale?.toLocaleLowerCase();
    if (locale === 'fi' || locale === 'sv') {
        return locale;
    } else {
        return 'fi';
    }
}

export const locale = (state: Readonly<Locale> = 'fi', action: AnyAction): Locale => {
    switch (action.type) {
        case FETCH_HENKILO_ASIOINTIKIELI_SUCCESS:
            return toSupportedLocale(action.lang);
        default:
            return state;
    }
};
