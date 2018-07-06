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
import AdminRedirect from "./components/henkilo/AdminRedirect";
import {
    updateDefaultNavigation,
    updateHenkiloNavigation, updateKayttooikeusryhmaNavigation, updateOppijaNavigation,
    updatePalvelukayttajaNavigation
} from './actions/navigation.actions';

export default <Route path="/" component={App} getNaviTabs={updateDefaultNavigation}>
    <Route path="/anomukset"
           component={AnomustListPageContainer}
           title="TITLE_ANOMUKSET"
           getNaviTabs={updateDefaultNavigation}
    />
    <Route path="/kutsutut"
           component={KutsututPageContainer}
           title="TITLE_KUTSUTUT"
           getNaviTabs={updateDefaultNavigation}
    />
    <Route path="/kutsulomake"
           component={KutsuminenPage}
           title="TITLE_KUTSULOMAKE"
           getNaviTabs={updateDefaultNavigation}
    />
    <Route path="/henkilohaku"
           component={HenkilohakuContainer}
           title="TITLE_HENKILOHAKU"
           getNaviTabs={updateDefaultNavigation}
    />
    <Route path="/virkailija/luonti"
           component={VirkailijaCreateContainer}
           title=""
    />
    <Route path="/oppija/luonti"
           component={OppijaCreateContainer}
           title="TITLE_OPPIJA_LUONTI"
           getNaviTabs={updateDefaultNavigation}
    />
    <Route path="/oppija/:oid"
           component={HenkiloViewContainer}
           title="TITLE_OPPIJA"
           getNaviTabs={updateOppijaNavigation}
    />
    <Route path="/virkailija/:oid"
           component={HenkiloViewContainer}
           title="TITLE_VIRKAILIJA"
           getNaviTabs={updateHenkiloNavigation}
    />
    <Route path="/admin/:oid"
           component={AdminRedirect}
           title="TITLE_ADMIN"
           getNaviTabs={updateHenkiloNavigation}
    />
    <Route path="/:henkiloType/:oid/vtjvertailu"
           component={VtjVertailuPage}
           title="TITLE_VTJ_VERTAILU"
           getNaviTabs={updateHenkiloNavigation}
    />
    <Route path="/:henkiloType/:oid/duplikaatit"
           component={DuplikaatitContainer}
           title="TITLE_DUPLIKAATTIHAKU"
           getNaviTabs={updateHenkiloNavigation}
    />
    <Route path="/omattiedot"
           component={OmattiedotContainer}
           title="TITLE_OMAT_TIEDOT"
    />
    <Route path="/uudelleenrekisterointi/:locale/:loginToken/:tyosahkopostiosoite/:salasana"
           component={VahvaTunnistusLisatiedotContainer}
           title=""
           isUnauthenticated
    />
    <Route path="/vahvatunnistusinfo/virhe/:locale/:loginToken"
           component={VahvaTunnistusInfoContainer}
           title="TITLE_VIRHESIVU"
           isUnauthenticated
    />
    <Route path="/vahvatunnistusinfo/:locale/:loginToken"
           component={VahvaTunnistusInfoContainer}
           title="TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN"
           isUnauthenticated
    />
    <Route path="/rekisteroidy"
           component={RekisteroidyContainer}
           title="TITLE_REKISTEROINTI"
           isUnauthenticated
    />
    <Route path="/oppijoidentuonti"
           component={OppijoidenTuontiContainer}
           title="TITLE_OPPIJOIDENTUONTI"
           getNaviTabs={updateDefaultNavigation}
    />
    <Route path="/kayttooikeusryhmat"
           component={KayttooikeusryhmatHallintaContainer}
           title="TITLE_KAYTTO_OIKEUSRYHMA"
    />
    <Route path="/kayttooikeusryhmat/lisaa"
           component={KayttooikeusryhmaPageContainer}
           title=""
           getNaviTabs={updateKayttooikeusryhmaNavigation}
    />
    <Route path="/kayttooikeusryhmat/:id"
           component={KayttooikeusryhmaPageContainer}
           title=""
    />
    <Route path="/palvelukayttaja/luonti"
           component={PalveluCreateContainer}
           title="TITLE_PALVELUKAYTTAJIEN_LUONTI"
           getNaviTabs={updatePalvelukayttajaNavigation}
    />
    <Route path="/palvelukayttaja"
           component={PalvelukayttajaHakuContainer}
           title=""
           getNaviTabs={updatePalvelukayttajaNavigation}
    />
    <Route path="/salasananresetointi/:locale/:poletti"
           component={SalansananResetointiPage}
           title=""
           isUnauthenticated
    />
</Route>
