import * as React from 'react';
import { Route, Routes } from 'react-router';
import App from './containers/App';
import { Kayttooikeusraportti } from './components/kayttooikeusraportti/Kayttooikeusraportti';
import { KutsututPage } from './components/kutsutut/KutsututPage';
import KutsuminenPage from './components/kutsuminen/KutsuminenPage';
import AnomusPage from './components/anomus/AnomusPage';
import { Omattiedot2Page } from './components/omattiedot/Omattiedot2Page';
import OppijoidenTuontiContainer from './components/oppijoidentuonti/OppijoidenTuontiContainer';
import { KayttooikeusryhmaPageContainer } from './components/kayttooikeusryhmat/kayttooikeusryhma/KayttooikeusryhmaPageContainer';
import { KayttooikeusryhmatPage } from './components/kayttooikeusryhmat/listaus/KayttooikeusryhmatPage';
import { OppijaCreate } from './components/henkilo/oppija/create/OppijaCreate';
import { VirkailijaCreateContainer } from './components/henkilo/VirkailijaCreateContainer';
import { PalvelukayttajaInfo } from './containers/PalvelukayttajaInfo';
import { JarjestelmatunnusCreatePage } from './components/jarjestelmatunnus/JarjestelmatunnusCreatePage';
import { JarjestelmatunnusListPage } from './components/jarjestelmatunnus/JarjestelmatunnusListPage';
import { JarjestelmatunnusEditPage } from './components/jarjestelmatunnus/JarjestelmatunnusEditPage';
import { OppijahakuPage } from './components/oppija/OppijahakuPage';
import { VirkailijahakuPage } from './components/virkailija/VirkailijahakuPage';
import { VirkailijaPage } from './components/virkailija/VirkailijaPage';
import { OppijaPage } from './components/oppija/OppijaPage';
import { OppijaDuplicatesPage } from './components/oppija/OppijaDuplicatesPage';
import { OppijaVtjVertailuPage } from './components/oppija/OppijaVtjVertailuPage';
import { RekisteroityminenPage } from './kayttaja/RekisteroityminenPage';

export const AppRoutes = () => (
    <Routes>
        <Route element={<App />}>
            <Route path="/palvelukayttajainfo" element={<PalvelukayttajaInfo />} />
            <Route path="/raportit/kayttooikeudet" element={<Kayttooikeusraportti />} />
            <Route path="/anomukset" element={<AnomusPage />} />
            <Route path="/kutsutut" element={<KutsututPage />} />
            <Route path="/kutsulomake" element={<KutsuminenPage />} />
            <Route path="/oppijahaku" element={<OppijahakuPage />} />
            <Route path="/oppija/luonti" element={<OppijaCreate />} />
            <Route path="/oppija/:oid" element={<OppijaPage />} />
            <Route path="/oppija/:oid/vtjvertailu" element={<OppijaVtjVertailuPage />} />
            <Route path="/oppija/:oid/duplikaatit" element={<OppijaDuplicatesPage />} />
            <Route path="/virkailijahaku" element={<VirkailijahakuPage />} />
            <Route path="/virkailija/luonti" element={<VirkailijaCreateContainer />} />
            <Route path="/virkailija/:oid" element={<VirkailijaPage />} />
            <Route path="/omattiedot" element={<Omattiedot2Page />} />
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
