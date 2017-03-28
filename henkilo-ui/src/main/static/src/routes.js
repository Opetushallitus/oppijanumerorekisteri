import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import KutsututPageContainer from './containers/KutsututPageContainer';
import KutsuFormPage from './containers/KutsuFormPage';
import AnomustListPageContainer from './containers/AnomusPageContainer';
import HenkiloPageContainer from './containers/HenkiloPageContainer';
import HenkiloViewContainer from './containers/henkilo/HenkiloViewContainer';

export default <Route path="/" component={App}>
    <Route path="/anomukset" component={AnomustListPageContainer} />
    <Route path="/kutsutut" component={KutsututPageContainer} />
    <Route path="/kutsulomake" component={KutsuFormPage} />
    <Route path="/henkilo" component={HenkiloPageContainer} />
    <Route path="/henkilo/:oid" component={HenkiloViewContainer} />
</Route>
