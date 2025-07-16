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
import {
    updateDefaultNavigation,
    updateHenkiloNavigation,
    updatePalvelukayttajaNavigation,
    updateJarjestelmatunnusNavigation,
} from './components/navigation/navigation.utils';
import { HenkiloState } from './reducers/henkilo.reducer';
import { NaviTab } from './types/navigation.type';
import PalvelukayttajaHakuPage from './components/palvelukayttaja/PalvelukayttajaHakuPage';
import { PalvelukayttajaInfo } from './containers/PalvelukayttajaInfo';
import { JarjestelmatunnusCreatePage } from './components/jarjestelmatunnus/JarjestelmatunnusCreatePage';
import { JarjestelmatunnusListPage } from './components/jarjestelmatunnus/JarjestelmatunnusListPage';
import { JarjestelmatunnusEditPage } from './components/jarjestelmatunnus/JarjestelmatunnusEditPage';

export type RouteType = {
    path: string;
    component: React.ReactNode;
    getNaviTabs: (() => NaviTab[]) | ((oid: string, henkiloState: HenkiloState, henkiloType: string) => NaviTab[]);
    backButton?: boolean;
    henkiloType?: string;
};

export default (
    <Route path="/" component={App} getNaviTabs={updateDefaultNavigation}>
        <Route path="/palvelukayttajainfo" component={PalvelukayttajaInfo} />
        <Route path="/raportit/kayttooikeudet" component={AccessRightReport} getNaviTabs={updateDefaultNavigation} />
        <Route path="/anomukset" component={AnomusPage} getNaviTabs={updateDefaultNavigation} />
        <Route path="/kutsutut" component={KutsututPage} getNaviTabs={updateDefaultNavigation} />
        <Route path="/kutsulomake" component={KutsuminenPage} getNaviTabs={updateDefaultNavigation} />
        <Route path="/henkilohaku" component={HenkilohakuContainer} getNaviTabs={updateDefaultNavigation} />
        <Route path="/virkailija/luonti" component={VirkailijaCreateContainer} />
        <Route path="/oppija/luonti" component={FormSwitch} getNaviTabs={updateDefaultNavigation} />
        <Route
            path="/oppija/:oid"
            component={HenkiloViewContainer}
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="oppija"
        />
        <Route
            path="/virkailija/:oid"
            component={HenkiloViewContainer}
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="virkailija"
        />
        <Route path="/admin/:oid" component={AdminRedirect} getNaviTabs={updateHenkiloNavigation} backButton />
        <Route
            path="/oppija/:oid/vtjvertailu"
            component={VtjVertailuPage}
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="oppija"
        />
        <Route
            path="/virkailija/:oid/vtjvertailu"
            component={VtjVertailuPage}
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="virkailija"
        />
        <Route
            path="/oppija/:oid/duplikaatit"
            component={DuplikaatitContainer}
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="oppija"
        />
        <Route
            path="/virkailija/:oid/duplikaatit"
            component={DuplikaatitContainer}
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="virkailija"
        />
        <Route path="/omattiedot" component={OmattiedotContainer} />
        <Route path="/oppijoidentuonti" component={OppijoidenTuontiContainer} getNaviTabs={updateDefaultNavigation} />
        <Route path="/kayttooikeusryhmat" component={KayttooikeusryhmatPage} />
        <Route path="/kayttooikeusryhmat/lisaa" component={KayttooikeusryhmaPageContainer} backButton />
        <Route path="/kayttooikeusryhmat/:id" component={KayttooikeusryhmaPageContainer} />
        <Route
            path="/palvelukayttaja/luonti"
            component={PalvelukayttajaCreatePage}
            getNaviTabs={updatePalvelukayttajaNavigation}
        />
        <Route
            path="/palvelukayttaja"
            component={PalvelukayttajaHakuPage}
            getNaviTabs={updatePalvelukayttajaNavigation}
        />
        <Route
            path="/jarjestelmatunnus"
            component={JarjestelmatunnusListPage}
            getNaviTabs={updateJarjestelmatunnusNavigation}
        />
        <Route
            path="/jarjestelmatunnus/luonti"
            component={JarjestelmatunnusCreatePage}
            getNaviTabs={() => updateJarjestelmatunnusNavigation()}
        />
        <Route
            path="/jarjestelmatunnus/:oid"
            component={JarjestelmatunnusEditPage}
            getNaviTabs={updateJarjestelmatunnusNavigation}
        />
    </Route>
);
