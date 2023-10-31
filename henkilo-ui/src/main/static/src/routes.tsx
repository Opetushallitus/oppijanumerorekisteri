import * as React from 'react';
import { Route } from 'react-router';
import App from './containers/App';
import AccessRightReport from './components/reports/accessrights/AccessRightsReport';
import KutsututPageContainer from './components/kutsutut/KutsututPageContainer';
import KutsuminenPage from './components/kutsuminen/KutsuminenPage';
import AnomusPage from './components/anomus/AnomusPage';
import OmattiedotContainer from './components/omattiedot/OmattiedotPageContainer';
import DuplikaatitContainer from './components/henkilo/duplikaatit/DuplikaatitContainer';
import HenkilohakuContainer from './components/henkilohaku/HenkilohakuContainer';
import OppijoidenTuontiContainer from './components/oppijoidentuonti/OppijoidenTuontiContainer';
import VtjVertailuPage from './components/henkilo/vtjvertailu/VtjVertailuPage';
import KayttooikeusryhmaPageContainer from './components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPageContainer';
import KayttooikeusryhmatHallintaContainer from './components/kayttooikeusryhmat/listaus/KayttooikeusryhmatHallintaContainer';
import FormSwitch from './components/henkilo/oppija/create/form/FormSwitch';
import VirkailijaCreateContainer from './components/henkilo/VirkailijaCreateContainer';
import { PalvelukayttajaCreatePage } from './components/palvelukayttaja/PalvelukayttajaCreatePage';
import HenkiloViewContainer from './components/henkilo/HenkiloViewContainer';
import AdminRedirect from './components/henkilo/AdminRedirect';
import {
    updateDefaultNavigation,
    updateHenkiloNavigation,
    updatePalvelukayttajaNavigation,
} from './components/navigation/navigation.utils';
import { HenkiloState } from './reducers/henkilo.reducer';
import { NaviTab } from './types/navigation.type';
import PalvelukayttajaHakuPage from './components/palvelukayttaja/PalvelukayttajaHakuPage';

export type RouteType = {
    path: string;
    component: React.ReactNode;
    title: string;
    getNaviTabs: (() => NaviTab[]) | ((oid: string, henkiloState: HenkiloState, henkiloType: string) => NaviTab[]);
    backButton?: boolean;
    henkiloType?: string;
};

export default (
    <Route path="/" component={App} getNaviTabs={updateDefaultNavigation}>
        <Route
            path="/raportit/kayttooikeudet"
            component={AccessRightReport}
            title="KAYTTOOIKEUSRAPORTTI_TITLE"
            getNaviTabs={updateDefaultNavigation}
        />
        <Route path="/anomukset" component={AnomusPage} title="TITLE_ANOMUKSET" getNaviTabs={updateDefaultNavigation} />
        <Route
            path="/kutsutut"
            component={KutsututPageContainer}
            title="TITLE_KUTSUTUT"
            getNaviTabs={updateDefaultNavigation}
        />
        <Route
            path="/kutsulomake"
            component={KutsuminenPage}
            title="TITLE_KUTSULOMAKE"
            getNaviTabs={updateDefaultNavigation}
        />
        <Route
            path="/henkilohaku"
            component={HenkilohakuContainer}
            title="TITLE_HENKILOHAKU"
            getNaviTabs={updateDefaultNavigation}
        />
        <Route path="/virkailija/luonti" component={VirkailijaCreateContainer} title="" />
        <Route
            path="/oppija/luonti"
            component={FormSwitch}
            title="TITLE_OPPIJA_LUONTI"
            getNaviTabs={updateDefaultNavigation}
        />
        <Route
            path="/oppija/:oid"
            component={HenkiloViewContainer}
            title="TITLE_OPPIJA"
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="oppija"
        />
        <Route
            path="/virkailija/:oid"
            component={HenkiloViewContainer}
            title="TITLE_VIRKAILIJA"
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="virkailija"
        />
        <Route
            path="/admin/:oid"
            component={AdminRedirect}
            title="TITLE_ADMIN"
            getNaviTabs={updateHenkiloNavigation}
            backButton
        />
        <Route
            path="/oppija/:oid/vtjvertailu"
            component={VtjVertailuPage}
            title="TITLE_VTJ_VERTAILU"
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="oppija"
        />
        <Route
            path="/virkailija/:oid/vtjvertailu"
            component={VtjVertailuPage}
            title="TITLE_VTJ_VERTAILU"
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="virkailija"
        />
        <Route
            path="/oppija/:oid/duplikaatit"
            component={DuplikaatitContainer}
            title="TITLE_DUPLIKAATTIHAKU"
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="oppija"
        />
        <Route
            path="/virkailija/:oid/duplikaatit"
            component={DuplikaatitContainer}
            title="TITLE_DUPLIKAATTIHAKU"
            getNaviTabs={updateHenkiloNavigation}
            backButton
            henkiloType="virkailija"
        />
        <Route path="/omattiedot" component={OmattiedotContainer} title="TITLE_OMAT_TIEDOT" />
        <Route
            path="/oppijoidentuonti"
            component={OppijoidenTuontiContainer}
            title="TITLE_OPPIJOIDENTUONTI"
            getNaviTabs={updateDefaultNavigation}
        />
        <Route
            path="/kayttooikeusryhmat"
            component={KayttooikeusryhmatHallintaContainer}
            title="TITLE_KAYTTO_OIKEUSRYHMA"
        />
        <Route
            path="/kayttooikeusryhmat/lisaa"
            component={KayttooikeusryhmaPageContainer}
            title="TITLE_KAYTTO_OIKEUSRYHMA"
            backButton
        />
        <Route
            path="/kayttooikeusryhmat/:id"
            component={KayttooikeusryhmaPageContainer}
            title="TITLE_KAYTTO_OIKEUSRYHMA"
        />
        <Route
            path="/palvelukayttaja/luonti"
            component={PalvelukayttajaCreatePage}
            title="TITLE_PALVELUKAYTTAJIEN_LUONTI"
            getNaviTabs={updatePalvelukayttajaNavigation}
        />
        <Route
            path="/palvelukayttaja"
            component={PalvelukayttajaHakuPage}
            title=""
            getNaviTabs={updatePalvelukayttajaNavigation}
        />
    </Route>
);
