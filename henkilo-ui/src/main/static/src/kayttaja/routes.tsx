import * as React from 'react';
import { Route, Routes } from 'react-router';

import KirjautumatonApp from './KirjautumatonApp';
import EmailVerificationContainer from './sahkopostivarmennus/EmailVerificationContainer';
import EmailVerificationErrorContainer from './sahkopostivarmennus/EmailVerificationErrorContainer';
import { EmailVerificationDonePage } from './sahkopostivarmennus/EmailVerificationDonePage';
import { SalasananVaihtoPage } from './SalasananVaihtoPage';
import { TunnusVanhentunutPage } from './TunnusVanhentunutPage';

export const KayttajaAppRoutes = () => (
    <Routes>
        <Route element={<KirjautumatonApp />}>
            <Route path="/kayttaja/vahvatunnistusinfo/:locale/:loginToken" element={<TunnusVanhentunutPage />} />
            <Route path="/kayttaja/sahkopostivarmistus/valmis/:locale" element={<EmailVerificationDonePage />} />
            <Route path="/kayttaja/sahkopostivarmistus/:locale/:loginToken" element={<EmailVerificationContainer />} />
            <Route
                path="/kayttaja/sahkopostivarmistus/virhe/:locale/:loginToken/:virhekoodi"
                element={<EmailVerificationErrorContainer />}
            />
            <Route path="/kayttaja/salasananvaihto/:locale/:loginToken" element={<SalasananVaihtoPage />} />
            <Route path="/kayttaja/vanhentunut/:locale" element={<TunnusVanhentunutPage />} />
        </Route>
    </Routes>
);
