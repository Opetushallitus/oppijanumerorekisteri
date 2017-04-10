import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import KutsututPageContainer from './containers/KutsututPageContainer';
import KutsuFormPage from './containers/KutsuFormPage';
import AnomustListPageContainer from './containers/AnomusPageContainer';
import OppijaViewContainer from './containers/henkilo/OppijaViewContainer';
import VirkailijaViewContainer from "./containers/henkilo/VirkailijaViewContainer";
import AdminViewContainer from "./containers/henkilo/AdminViewContainer";

export default <Route path="/" component={App}>
    <Route path="/anomukset" component={AnomustListPageContainer} />
    <Route path="/kutsutut" component={KutsututPageContainer} />
    <Route path="/kutsulomake" component={KutsuFormPage} />
    <Route path="/oppija/:oid" component={OppijaViewContainer} />
    <Route path="/virkailija/:oid" component={VirkailijaViewContainer} />
    <Route path="/admin/:oid" component={AdminViewContainer} />
</Route>
