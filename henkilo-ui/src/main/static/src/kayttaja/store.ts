import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { kayttooikeusApi } from '../api/kayttooikeus';
import { oppijanumerorekisteriApi } from '../api/oppijanumerorekisteri';
import { lokalisointiApi } from '../api/lokalisointi';
import l10n from '../reducers/l10n.reducer';
import { koodistoApi } from '../api/koodisto';
import { notifications } from '../reducers/notifications.reducer';
import { notificationList } from '../reducers/notification.reducer';
import { henkilo } from '../reducers/henkilo.reducer';
import { locale } from '../reducers/locale.reducer';

const isDev = process.env.NODE_ENV !== 'production';
const isClient = typeof window !== 'undefined';

const rootReducer = {
    l10n,
    locale,
    henkilo,
    notifications,
    notificationList,
};

export const store = configureStore({
    reducer: {
        ...rootReducer,
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
