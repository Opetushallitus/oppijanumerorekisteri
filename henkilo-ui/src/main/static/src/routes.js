import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import KutsututPageContainer from './containers/KutsututPageContainer';
import KutsuminenPage from './containers/KutsuminenPage';
import AnomustListPageContainer from './containers/AnomusPageContainer';
import OppijaViewContainer from './components/henkilo/OppijaViewContainer';
import VirkailijaViewContainer from "./components/henkilo/VirkailijaViewContainer";
import OmattiedotContainer from "./components/omattiedot/OmattiedotPageContainer";
import AdminViewContainer from "./components/henkilo/AdminViewContainer";
import HenkilohakuContainer from "./components/henkilohaku/HenkilohakuContainer";
import VirkailijaDuplikaatitContainer from "./components/henkilo/duplikaatit/VirkailijaDuplikaatitContainer";

export default <Route path="/" component={App}>
    <Route path="/anomukset" component={AnomustListPageContainer} />
    <Route path="/kutsutut" component={KutsututPageContainer} />
    <Route path="/kutsulomake" component={KutsuminenPage} />
    <Route path="/henkilohaku" component={HenkilohakuContainer} />
    <Route path="/oppija/:oid" component={OppijaViewContainer} />
    <Route path="/virkailija/:oid" component={VirkailijaViewContainer} />
    <Route path="/virkailija/:oid/duplikaatit" component={VirkailijaDuplikaatitContainer} />
    <Route path="/omattiedot" component={OmattiedotContainer} />
    <Route path="/admin/:oid" component={AdminViewContainer} />
</Route>
