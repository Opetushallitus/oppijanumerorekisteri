import * as React from 'react';
import { Route, Routes } from 'react-router';
import App from './containers/App';
import { Kayttooikeusraportti } from './components/kayttooikeusraportti/Kayttooikeusraportti';
import { KutsututPage } from './components/kutsutut/KutsututPage';
import KutsuminenPage from './components/kutsuminen/KutsuminenPage';
import AnomusPage from './components/anomus/AnomusPage';
import { OmattiedotPage } from './components/omattiedot/OmattiedotPage';
import { Omattiedot2Page } from './components/omattiedot/Omattiedot2Page';
import { DuplikaatitContainer } from './components/henkilo/duplikaatit/DuplikaatitContainer';
import HenkilohakuContainer from './components/henkilohaku/HenkilohakuContainer';
import OppijoidenTuontiContainer from './components/oppijoidentuonti/OppijoidenTuontiContainer';
import { VtjVertailuPage } from './components/henkilo/vtjvertailu/VtjVertailuPage';
import { KayttooikeusryhmaPageContainer } from './components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPageContainer';
import { KayttooikeusryhmatPage } from './components/kayttooikeusryhmat/listaus/KayttooikeusryhmatPage';
import { OppijaCreate } from './components/henkilo/oppija/create/OppijaCreate';
import { VirkailijaCreateContainer } from './components/henkilo/VirkailijaCreateContainer';
import { PalvelukayttajaInfo } from './containers/PalvelukayttajaInfo';
import { JarjestelmatunnusCreatePage } from './components/jarjestelmatunnus/JarjestelmatunnusCreatePage';
import { JarjestelmatunnusListPage } from './components/jarjestelmatunnus/JarjestelmatunnusListPage';
import { JarjestelmatunnusEditPage } from './components/jarjestelmatunnus/JarjestelmatunnusEditPage';
import { OppijahakuPage } from './components/oppija/OppijahakuPage';
import { OppijaViewPage } from './components/henkilo/OppijaViewPage';
import { VirkailijaViewPage } from './components/henkilo/VirkailijaViewPage';
import { VirkailijahakuPage } from './components/virkailija/VirkailijahakuPage';
import { VirkailijaPage } from './components/virkailija/VirkailijaPage';
import { OppijaPage } from './components/oppija/OppijaPage';
import { OppijaDuplicatesPage } from './components/oppija/OppijaDuplicatesPage';
import { OppijaVtjVertailuPage } from './components/oppija/OppijaVtjVertailuPage';
import { isNewNavi } from './components/navigation/TopNavigation';
import { RekisteroityminenPage } from './kayttaja/RekisteroityminenPage';

export const AppRoutes = () => (
    <Routes>
        <Route element={<App />}>
            <Route path="/palvelukayttajainfo" element={<PalvelukayttajaInfo />} />
            <Route path="/raportit/kayttooikeudet" element={<Kayttooikeusraportti />} />
            <Route path="/anomukset" element={<AnomusPage />} />
            <Route path="/kutsutut" element={<KutsututPage />} />
            <Route path="/kutsulomake" element={<KutsuminenPage />} />
            <Route path="/henkilohaku" element={isNewNavi ? undefined : <HenkilohakuContainer />} />
            <Route path="/oppijahaku" element={<OppijahakuPage />} />
            <Route path="/oppija/luonti" element={<OppijaCreate />} />
            <Route path="/oppija/:oid" element={isNewNavi ? <OppijaPage /> : <OppijaViewPage />} />
            <Route path="/oppija2/:oid" element={<OppijaPage />} />
            <Route
                path="/oppija/:oid/vtjvertailu"
                element={isNewNavi ? <OppijaVtjVertailuPage /> : <VtjVertailuPage henkiloType="oppija" />}
            />
            <Route
                path="/oppija/:oid/duplikaatit"
                element={isNewNavi ? <OppijaDuplicatesPage /> : <DuplikaatitContainer henkiloType="oppija" />}
            />
            <Route path="/virkailijahaku" element={<VirkailijahakuPage />} />
            <Route path="/virkailija/luonti" element={<VirkailijaCreateContainer />} />
            <Route path="/virkailija/:oid" element={isNewNavi ? <VirkailijaPage /> : <VirkailijaViewPage />} />
            <Route path="/virkailija2/:oid" element={<VirkailijaPage />} />
            <Route
                path="/virkailija/:oid/vtjvertailu"
                element={isNewNavi ? undefined : <VtjVertailuPage henkiloType="virkailija" />}
            />
            <Route
                path="/virkailija/:oid/duplikaatit"
                element={isNewNavi ? undefined : <DuplikaatitContainer henkiloType="virkailija" />}
            />
            <Route path="/omattiedot" element={isNewNavi ? <Omattiedot2Page /> : <OmattiedotPage />} />
            <Route path="/omattiedot2" element={<Omattiedot2Page />} />
            <Route path="/oppijoidentuonti" element={<OppijoidenTuontiContainer />} />
            <Route path="/kayttooikeusryhmat" element={<KayttooikeusryhmatPage />} />
            <Route path="/kayttooikeusryhmat/lisaa" element={<KayttooikeusryhmaPageContainer />} />
            <Route path="/kayttooikeusryhmat/:id" element={<KayttooikeusryhmaPageContainer />} />
            <Route path="/jarjestelmatunnus" element={<JarjestelmatunnusListPage />} />
            <Route path="/jarjestelmatunnus/luonti" element={<JarjestelmatunnusCreatePage />} />
            <Route path="/jarjestelmatunnus/:oid" element={<JarjestelmatunnusEditPage />} />
            <Route path="/rekisteroityminen" element={<RekisteroityminenPage />} />
        </Route>
    </Routes>
);
