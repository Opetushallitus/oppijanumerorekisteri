import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { kayttooikeusApi } from './api/kayttooikeus';
import { oppijanumerorekisteriApi } from './api/oppijanumerorekisteri';
import { lokalisointiApi } from './api/lokalisointi';
import { koodistoApi } from './api/koodisto';
import henkilohakuReducer from './slices/henkilohakuSlice';
import oppijahakuReducer from './slices/oppijahakuSlice';
import virkailijahakuReducer from './slices/virkailijahakuSlice';
import navigationReducer from './slices/navigationSlice';
import toastReducer from './slices/toastSlice';
import toastMiddleware from './middleware/toastMiddleware';

const isDev = process.env.NODE_ENV !== 'production';
const isClient = typeof window !== 'undefined';

export const store = configureStore({
    reducer: {
        henkilohaku: henkilohakuReducer,
        toasts: toastReducer,
        navigation: navigationReducer,
        virkailijahaku: virkailijahakuReducer,
        oppijahaku: oppijahakuReducer,
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
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
