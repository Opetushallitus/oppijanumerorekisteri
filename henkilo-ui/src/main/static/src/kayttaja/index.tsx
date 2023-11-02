import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { syncHistoryWithStore } from 'react-router-redux';
import { urls } from 'oph-urls-js';

import frontUrls from '../henkilo-ui-virkailija-oph';
import routes from './routes';
import PropertySingleton from '../globals/PropertySingleton';
import { store } from './store';

import '../reset.css';
import '../general-style.css';
import 'oph-virkailija-style-guide/oph-styles.css';
import '../index.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../flex.css';

urls.addProperties(frontUrls);
urls.addCallerId(PropertySingleton.getState().opintopolkuCallerId);
urls.load();

const App = () => {
    const browserHistory = useRouterHistory(createHistory)({
        basename: '/henkilo-ui',
    });

    const history = syncHistoryWithStore(browserHistory, store);
    window.opintopolku_caller_id = PropertySingleton.getState().opintopolkuCallerId;

    return (
        <Provider store={store}>
            <Router history={history} routes={routes} onUpdate={() => window.scrollTo(0, 0)} />
        </Provider>
    );
};

render(<App />, document.getElementById('root'));
