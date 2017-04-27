import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import {useRouterHistory} from 'react-router'
import {createHistory} from 'history'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from './containers/Root'
import configureStore from './store/configureStore'

import './reset.css';
import './general-style.css';
import 'oph-virkailija-style-guide/oph-styles.css'
import './index.css';
import 'font-awesome/css/font-awesome.min.css';
import 'react-select/dist/react-select.css';


let store = configureStore();
const browserHistory = useRouterHistory(createHistory)({
    basename: '/henkilo-ui'
});
const history = syncHistoryWithStore(browserHistory, store);

render(
    <Provider store={store}>
        <Root history={history} />
    </Provider>,
  document.getElementById('root')
);
