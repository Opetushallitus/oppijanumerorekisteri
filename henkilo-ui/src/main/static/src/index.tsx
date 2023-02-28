import 'react-app-polyfill/stable';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { syncHistoryWithStore } from 'react-router-redux';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import routes from './routes';
import PropertySingleton from './globals/PropertySingleton';
import rootReducer from './reducers';
import { kayttooikeusApi } from './api/kayttooikeus';

import './reset.css';
import './general-style.css';
import 'oph-virkailija-style-guide/oph-styles.css';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';
import './flex.css';

const isDev = process.env.NODE_ENV !== 'production';
const isClient = typeof window !== 'undefined';

const App = () => {
    const store = configureStore({
        reducer: {
            ...rootReducer,
            [kayttooikeusApi.reducerPath]: kayttooikeusApi.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: true,
                immutableCheck: false,
                serializableCheck: false,
            }).concat(kayttooikeusApi.middleware),
        devTools: isDev && isClient,
    });
    setupListeners(store.dispatch);
    const browserHistory = useRouterHistory(createHistory)({
        basename: '/henkilo-ui',
    });

    const history = syncHistoryWithStore(browserHistory, store);

    (window as any).opintopolku_caller_id = PropertySingleton.getState().opintopolkuCallerId;

    return (
        <Provider store={store}>
            <div>
                <Router history={history} routes={routes} onUpdate={() => window.scrollTo(0, 0)} />
            </div>
        </Provider>
    );
};

render(<App />, document.getElementById('root'));
