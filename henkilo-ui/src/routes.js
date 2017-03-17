import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import KutsututPageContainer from './containers/KutsututPageContainer';
import KutsuPageContainer from './containers/KutsuPageContainer';
import AnomustListPageContainer from './containers/AnomusPageContainer';
import HenkiloPageContainer from './containers/HenkiloPageContainer';

export default <Route path="/" component={App}>
    <Route path="/anomukset" component={AnomustListPageContainer} />
    <Route path="/kutsu/list" component={KutsututPageContainer} />
    <Route path="/uusikutsu" component={KutsuPageContainer} />
    <Route path="/henkilo" component={HenkiloPageContainer} />
</Route>