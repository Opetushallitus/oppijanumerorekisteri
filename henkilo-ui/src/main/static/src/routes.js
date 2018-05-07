import React from 'react'
import { Route } from 'react-router'
import App from './containers/App'
import KutsututPageContainer from './components/kutsutut/KutsututPageContainer';
import KutsuminenPage from './components/kutsuminen/KutsuminenPage';
import AnomustListPageContainer from './components/anomus/AnomusPageContainer';
import OmattiedotContainer from "./components/omattiedot/OmattiedotPageContainer";
import DuplikaatitContainer from "./components/henkilo/duplikaatit/DuplikaatitContainer";
import HenkilohakuContainer from "./components/henkilohaku/HenkilohakuContainer";
import VahvaTunnistusInfoContainer from "./components/rekisterointi/VahvaTunnistusInfoContainer";
import RekisteroidyContainer from "./components/rekisterointi/RekisteroidyContainer";
import OppijoidenTuontiContainer from "./components/oppijoidentuonti/OppijoidenTuontiContainer";
import VtjVertailuPage from "./components/henkilo/vtjvertailu/VtjVertailuPage";
import KayttooikeusryhmaPageContainer from "./components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPageContainer";
import KayttooikeusryhmatHallintaContainer from "./components/kayttooikeusryhmat/listaus/KayttooikeusryhmatHallintaContainer";
import OppijaCreateContainer from "./components/henkilo/OppijaCreateContainer";
import VirkailijaCreateContainer from './components/henkilo/VirkailijaCreateContainer';
import PalveluCreateContainer from "./components/henkilo/PalveluCreateContainer";
import PalvelukayttajaHakuContainer from "./components/palvelukayttaja/PalvelukayttajaHakuContainer";
import SalansananResetointiPage from "./components/salasananresetointi/SalasananResetointiPage";
import VahvaTunnistusLisatiedotContainer from './components/rekisterointi/VahvaTunnistusLisatiedotContainer';
import HenkiloViewContainer from "./components/henkilo/HenkiloViewContainer";

export default <Route path="/" component={App}>
    <Route path="/anomukset" component={AnomustListPageContainer} />
    <Route path="/kutsutut" component={KutsututPageContainer} />
    <Route path="/kutsulomake" component={KutsuminenPage} />
    <Route path="/henkilohaku" component={HenkilohakuContainer} />
    <Route path="/virkailija/luonti" component={VirkailijaCreateContainer} />
    <Route path="/oppija/luonti" component={OppijaCreateContainer} />
    <Route path="/oppija/:oid" component={HenkiloViewContainer} />
    <Route path="/virkailija/:oid" component={HenkiloViewContainer} />
    <Route path="/:henkiloType/:oid/vtjvertailu" component={VtjVertailuPage}/>
    <Route path="/:henkiloType/:oid/duplikaatit" component={DuplikaatitContainer} />
    <Route path="/omattiedot" component={OmattiedotContainer} />
    <Route path="/uudelleenrekisterointi/:locale/:loginToken/:tyosahkopostiosoite/:salasana" component={VahvaTunnistusLisatiedotContainer} />
    <Route path="/vahvatunnistusinfo/virhe/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
    <Route path="/vahvatunnistusinfo/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
    <Route path="/rekisteroidy" component={RekisteroidyContainer} />
    <Route path="/oppijoidentuonti" component={OppijoidenTuontiContainer} />
    <Route path="/kayttooikeusryhmat" component={KayttooikeusryhmatHallintaContainer} />
    <Route path="/kayttooikeusryhmat/lisaa" component={KayttooikeusryhmaPageContainer} />
    <Route path="/kayttooikeusryhmat/:id" component={KayttooikeusryhmaPageContainer} />
    <Route path="/palvelukayttaja/luonti" component={PalveluCreateContainer} />
    <Route path="/palvelukayttaja" component={PalvelukayttajaHakuContainer} />
    <Route path="/salasananresetointi/:locale/:poletti" component={SalansananResetointiPage} />
</Route>
