import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { urls } from 'oph-urls-js';

import frontUrls from './henkilo-ui-virkailija-oph';
import { AppRoutes } from './routes';
import PropertySingleton from './globals/PropertySingleton';
import { store } from './store';

import './reset.css';
import './general-style.css';
import 'oph-virkailija-style-guide/oph-styles.css';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';
import './flex.css';
import './oph-design-system.css';

urls.addProperties(frontUrls);
urls.addCallerId(PropertySingleton.getState().opintopolkuCallerId);
urls.load();
window.opintopolku_caller_id = PropertySingleton.getState().opintopolkuCallerId;

const root = document.getElementById('root');
ReactDOM.createRoot(root).render(
    <BrowserRouter basename="/henkilo-ui">
        <Provider store={store}>
            <AppRoutes />
        </Provider>
    </BrowserRouter>
);
