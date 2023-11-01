import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { routerReducer as routing } from 'react-router-redux';

import { kayttooikeusApi } from '../api/kayttooikeus';
import { oppijanumerorekisteriApi } from '../api/oppijanumerorekisteri';
import { lokalisointiApi } from '../api/lokalisointi';
import l10n from '../reducers/l10n.reducer';
import koodisto from '../reducers/koodisto.reducer';
import { notifications } from '../reducers/notifications.reducer';

const isDev = process.env.NODE_ENV !== 'production';
const isClient = typeof window !== 'undefined';

const rootReducer = {
    routing,
    l10n,
    koodisto,
    notifications,
};

export const store = configureStore({
    reducer: {
        ...rootReducer,
        [kayttooikeusApi.reducerPath]: kayttooikeusApi.reducer,
        [oppijanumerorekisteriApi.reducerPath]: oppijanumerorekisteriApi.reducer,
        [lokalisointiApi.reducerPath]: lokalisointiApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: true,
            immutableCheck: false,
            serializableCheck: false,
        })
            .concat(kayttooikeusApi.middleware)
            .concat(oppijanumerorekisteriApi.middleware)
            .concat(lokalisointiApi.middleware),
    devTools: isDev && isClient,
});

setupListeners(store.dispatch);
const useAppDispatch = () => store.dispatch;

export { useAppDispatch };
export type KayttajaRootState = ReturnType<typeof store.getState>;
export type KayttajaAppDispatch = typeof store.dispatch;
