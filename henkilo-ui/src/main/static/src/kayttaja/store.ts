import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { kayttooikeusApi } from '../api/kayttooikeus';
import { oppijanumerorekisteriApi } from '../api/oppijanumerorekisteri';
import { lokalisointiApi } from '../api/lokalisointi';
import { koodistoApi } from '../api/koodisto';
import { henkilo } from '../reducers/henkilo.reducer';
import toastReducer from '../slices/toastSlice';
import toastMiddleware from '../middleware/toastMiddleware';

const isDev = process.env.NODE_ENV !== 'production';
const isClient = typeof window !== 'undefined';

const rootReducer = {
    henkilo,
};

export const store = configureStore({
    reducer: {
        ...rootReducer,
        toasts: toastReducer,
        [kayttooikeusApi.reducerPath]: kayttooikeusApi.reducer,
        [oppijanumerorekisteriApi.reducerPath]: oppijanumerorekisteriApi.reducer,
        [lokalisointiApi.reducerPath]: lokalisointiApi.reducer,
        [koodistoApi.reducerPath]: koodistoApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            thunk: true,
            immutableCheck: false,
            serializableCheck: false,
        })
            .concat(toastMiddleware)
            .concat(kayttooikeusApi.middleware)
            .concat(oppijanumerorekisteriApi.middleware)
            .concat(lokalisointiApi.middleware)
            .concat(koodistoApi.middleware),
    devTools: isDev && isClient,
});

setupListeners(store.dispatch);
const useAppDispatch = () => store.dispatch;

export { useAppDispatch };
export type KayttajaRootState = ReturnType<typeof store.getState>;
export type KayttajaAppDispatch = typeof store.dispatch;
