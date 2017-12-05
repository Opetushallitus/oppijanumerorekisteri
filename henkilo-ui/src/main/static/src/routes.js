import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import KutsututPageContainer from './containers/KutsututPageContainer';
import KutsuminenPage from './containers/KutsuminenPage';
import AnomustListPageContainer from './components/anomus/AnomusPageContainer';
import OppijaViewContainer from './components/henkilo/OppijaViewContainer';
import VirkailijaViewContainer from "./components/henkilo/VirkailijaViewContainer";
import OmattiedotContainer from "./components/omattiedot/OmattiedotPageContainer";
import DuplikaatitContainer from "./components/henkilo/duplikaatit/DuplikaatitContainer";
import AdminViewContainer from "./components/henkilo/AdminViewContainer";
import HenkilohakuContainer from "./components/henkilohaku/HenkilohakuContainer";
import VahvaTunnistusInfoContainer from "./components/rekisterointi/VahvaTunnistusInfoContainer";
import RekisteroidyContainer from "./components/rekisterointi/RekisteroidyContainer";
import OppijoidenTuontiContainer from "./components/oppijoidentuonti/OppijoidenTuontiContainer";
import VtjVertailuPage from "./components/henkilo/vtjvertailu/VtjVertailuPage";
import KayttooikeusryhmaPageContainer from "./components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPageContainer";
import KayttooikeusryhmatHallintaContainer from "./components/kayttooikeusryhmat/listaus/KayttooikeusryhmatHallintaContainer";
import OppijaCreateContainer from "./components/henkilo/OppijaCreateContainer";
import PalveluCreateContainer from "./components/henkilo/PalveluCreateContainer";
import SalansananResetointiPage from "./components/salasananresetointi/SalasananResetointiPage";

export default <Route path="/" component={App}>
    <Route path="/anomukset" component={AnomustListPageContainer} />
    <Route path="/kutsutut" component={KutsututPageContainer} />
    <Route path="/kutsulomake" component={KutsuminenPage} />
    <Route path="/henkilohaku" component={HenkilohakuContainer} />
    <Route path="/oppija/luonti" component={OppijaCreateContainer} />
    <Route path="/oppija/:oid" component={OppijaViewContainer} />
    <Route path="/virkailija/:oid" component={VirkailijaViewContainer} />
    <Route path="/:henkiloType/:oid/vtjvertailu" component={VtjVertailuPage}/>
    <Route path="/:henkiloType/:oid/duplikaatit" component={DuplikaatitContainer} />
    <Route path="/omattiedot" component={OmattiedotContainer} />
    <Route path="/admin/:oid" component={AdminViewContainer} />
    <Route path="/vahvatunnistusinfo/virhe/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
    <Route path="/vahvatunnistusinfo/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
    <Route path="/rekisteroidy" component={RekisteroidyContainer} />
    <Route path="/oppijoidentuonti" component={OppijoidenTuontiContainer} />
    <Route path="/kayttooikeusryhmat" component={KayttooikeusryhmatHallintaContainer} />
    <Route path="/kayttooikeusryhmat/lisaa" component={KayttooikeusryhmaPageContainer} />
    <Route path="/kayttooikeusryhmat/:id" component={KayttooikeusryhmaPageContainer} />
    <Route path="/palvelukayttaja/luonti" component={PalveluCreateContainer} />
    <Route path="/salasananresetointi/:locale/:poletti" component={SalansananResetointiPage} />
</Route>
