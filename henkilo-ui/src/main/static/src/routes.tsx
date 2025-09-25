import * as React from 'react';
import { Route, Routes } from 'react-router';
import App from './containers/App';
import AccessRightReport from './components/reports/accessrights/AccessRightsReport';
import { KutsututPage } from './components/kutsutut/KutsututPage';
import KutsuminenPage from './components/kutsuminen/KutsuminenPage';
import AnomusPage from './components/anomus/AnomusPage';
import { OmattiedotPage } from './components/omattiedot/OmattiedotPage';
import { DuplikaatitContainer } from './components/henkilo/duplikaatit/DuplikaatitContainer';
import HenkilohakuContainer from './components/henkilohaku/HenkilohakuContainer';
import OppijoidenTuontiContainer from './components/oppijoidentuonti/OppijoidenTuontiContainer';
import { VtjVertailuPage } from './components/henkilo/vtjvertailu/VtjVertailuPage';
import { KayttooikeusryhmaPageContainer } from './components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPageContainer';
import { KayttooikeusryhmatPage } from './components/kayttooikeusryhmat/listaus/KayttooikeusryhmatPage';
import FormSwitch from './components/henkilo/oppija/create/form/FormSwitch';
import { VirkailijaCreateContainer } from './components/henkilo/VirkailijaCreateContainer';
import { PalvelukayttajaCreatePage } from './components/palvelukayttaja/PalvelukayttajaCreatePage';
import AdminRedirect from './components/henkilo/AdminRedirect';
import PalvelukayttajaHakuPage from './components/palvelukayttaja/PalvelukayttajaHakuPage';
import { PalvelukayttajaInfo } from './containers/PalvelukayttajaInfo';
import { JarjestelmatunnusCreatePage } from './components/jarjestelmatunnus/JarjestelmatunnusCreatePage';
import { JarjestelmatunnusListPage } from './components/jarjestelmatunnus/JarjestelmatunnusListPage';
import { JarjestelmatunnusEditPage } from './components/jarjestelmatunnus/JarjestelmatunnusEditPage';
import { OppijaViewPage } from './components/henkilo/OppijaViewPage';
import { VirkailijaViewPage } from './components/henkilo/VirkailijaViewPage';

export const AppRoutes = () => (
    <Routes>
        <Route element={<App />}>
            <Route path="/palvelukayttajainfo" element={<PalvelukayttajaInfo />} />
            <Route path="/raportit/kayttooikeudet" element={<AccessRightReport />} />
            <Route path="/anomukset" element={<AnomusPage />} />
            <Route path="/kutsutut" element={<KutsututPage />} />
            <Route path="/kutsulomake" element={<KutsuminenPage />} />
            <Route path="/henkilohaku" element={<HenkilohakuContainer />} />
            <Route path="/virkailija/luonti" element={<VirkailijaCreateContainer />} />
            <Route path="/oppija/luonti" element={<FormSwitch />} />
            <Route path="/oppija/:oid" element={<OppijaViewPage />} />
            <Route path="/virkailija/:oid" element={<VirkailijaViewPage />} />
            <Route path="/admin/:oid" element={<AdminRedirect />} />
            <Route path="/oppija/:oid/vtjvertailu" element={<VtjVertailuPage henkiloType="oppija" />} />
            <Route path="/virkailija/:oid/vtjvertailu" element={<VtjVertailuPage henkiloType="virkailija" />} />
            <Route path="/oppija/:oid/duplikaatit" element={<DuplikaatitContainer henkiloType="oppija" />} />
            <Route path="/virkailija/:oid/duplikaatit" element={<DuplikaatitContainer henkiloType="virkailija" />} />
            <Route path="/omattiedot" element={<OmattiedotPage />} />
            <Route path="/oppijoidentuonti" element={<OppijoidenTuontiContainer />} />
            <Route path="/kayttooikeusryhmat" element={<KayttooikeusryhmatPage />} />
            <Route path="/kayttooikeusryhmat/lisaa" element={<KayttooikeusryhmaPageContainer />} />
            <Route path="/kayttooikeusryhmat/:id" element={<KayttooikeusryhmaPageContainer />} />
            <Route path="/palvelukayttaja/luonti" element={<PalvelukayttajaCreatePage />} />
            <Route path="/palvelukayttaja" element={<PalvelukayttajaHakuPage />} />
            <Route path="/jarjestelmatunnus" element={<JarjestelmatunnusListPage />} />
            <Route path="/jarjestelmatunnus/luonti" element={<JarjestelmatunnusCreatePage />} />
            <Route path="/jarjestelmatunnus/:oid" element={<JarjestelmatunnusEditPage />} />
        </Route>
    </Routes>
);
