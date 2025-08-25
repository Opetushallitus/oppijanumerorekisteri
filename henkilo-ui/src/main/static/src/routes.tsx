import * as React from 'react';
import { Route } from 'react-router';
import App from './containers/App';
import AccessRightReport from './components/reports/accessrights/AccessRightsReport';
import { KutsututPage } from './components/kutsutut/KutsututPage';
import KutsuminenPage from './components/kutsuminen/KutsuminenPage';
import AnomusPage from './components/anomus/AnomusPage';
import OmattiedotContainer from './components/omattiedot/OmattiedotPageContainer';
import { DuplikaatitContainer } from './components/henkilo/duplikaatit/DuplikaatitContainer';
import HenkilohakuContainer from './components/henkilohaku/HenkilohakuContainer';
import OppijoidenTuontiContainer from './components/oppijoidentuonti/OppijoidenTuontiContainer';
import { VtjVertailuPage } from './components/henkilo/vtjvertailu/VtjVertailuPage';
import { KayttooikeusryhmaPageContainer } from './components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPageContainer';
import { KayttooikeusryhmatPage } from './components/kayttooikeusryhmat/listaus/KayttooikeusryhmatPage';
import FormSwitch from './components/henkilo/oppija/create/form/FormSwitch';
import VirkailijaCreateContainer from './components/henkilo/VirkailijaCreateContainer';
import { PalvelukayttajaCreatePage } from './components/palvelukayttaja/PalvelukayttajaCreatePage';
import HenkiloViewContainer from './components/henkilo/HenkiloViewContainer';
import AdminRedirect from './components/henkilo/AdminRedirect';
import PalvelukayttajaHakuPage from './components/palvelukayttaja/PalvelukayttajaHakuPage';
import { PalvelukayttajaInfo } from './containers/PalvelukayttajaInfo';
import { JarjestelmatunnusCreatePage } from './components/jarjestelmatunnus/JarjestelmatunnusCreatePage';
import { JarjestelmatunnusListPage } from './components/jarjestelmatunnus/JarjestelmatunnusListPage';
import { JarjestelmatunnusEditPage } from './components/jarjestelmatunnus/JarjestelmatunnusEditPage';

export type RouteType = {
    path: string;
    component: React.ReactNode;
    henkiloType?: string;
};

export default (
    <Route path="/" component={App}>
        <Route path="/palvelukayttajainfo" component={PalvelukayttajaInfo} />
        <Route path="/raportit/kayttooikeudet" component={AccessRightReport} />
        <Route path="/anomukset" component={AnomusPage} />
        <Route path="/kutsutut" component={KutsututPage} />
        <Route path="/kutsulomake" component={KutsuminenPage} />
        <Route path="/henkilohaku" component={HenkilohakuContainer} />
        <Route path="/virkailija/luonti" component={VirkailijaCreateContainer} />
        <Route path="/oppija/luonti" component={FormSwitch} />
        <Route path="/oppija/:oid" component={HenkiloViewContainer} henkiloType="oppija" />
        <Route path="/virkailija/:oid" component={HenkiloViewContainer} henkiloType="virkailija" />
        <Route path="/admin/:oid" component={AdminRedirect} />
        <Route path="/oppija/:oid/vtjvertailu" component={VtjVertailuPage} henkiloType="oppija" />
        <Route path="/virkailija/:oid/vtjvertailu" component={VtjVertailuPage} henkiloType="virkailija" />
        <Route path="/oppija/:oid/duplikaatit" component={DuplikaatitContainer} henkiloType="oppija" />
        <Route path="/virkailija/:oid/duplikaatit" component={DuplikaatitContainer} henkiloType="virkailija" />
        <Route path="/omattiedot" component={OmattiedotContainer} />
        <Route path="/oppijoidentuonti" component={OppijoidenTuontiContainer} />
        <Route path="/kayttooikeusryhmat" component={KayttooikeusryhmatPage} />
        <Route path="/kayttooikeusryhmat/lisaa" component={KayttooikeusryhmaPageContainer} />
        <Route path="/kayttooikeusryhmat/:id" component={KayttooikeusryhmaPageContainer} />
        <Route path="/palvelukayttaja/luonti" component={PalvelukayttajaCreatePage} />
        <Route path="/palvelukayttaja" component={PalvelukayttajaHakuPage} />
        <Route path="/jarjestelmatunnus" component={JarjestelmatunnusListPage} />
        <Route path="/jarjestelmatunnus/luonti" component={JarjestelmatunnusCreatePage} />
        <Route path="/jarjestelmatunnus/:oid" component={JarjestelmatunnusEditPage} />
    </Route>
);
