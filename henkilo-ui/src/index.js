import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import Root from './containers/Root'
import configureStore from './store/configureStore'

import './reset.css';
import './general-style.css';
import 'oph-virkailija-style-guide/oph-styles.css'
import './index.css';


let store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

render(
    <Provider store={store}>
        <Root history={history} />
    </Provider>,
  document.getElementById('root')
);
