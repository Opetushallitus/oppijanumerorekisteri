import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';

import { KayttajaAppRoutes } from './routes';
import { store } from './store';

import '../reset.css';
import 'oph-virkailija-style-guide/oph-styles.css';
import '../index.css';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';
import '../flex.css';
import '../oph-design-system.css';

const root = document.getElementById('root');
if (root) {
    ReactDOM.createRoot(root).render(
        <BrowserRouter basename="/henkilo-ui">
            <Provider store={store}>
                <KayttajaAppRoutes />
            </Provider>
        </BrowserRouter>
    );
}
