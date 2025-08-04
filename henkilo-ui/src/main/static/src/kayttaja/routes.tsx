import * as React from 'react';
import { Route } from 'react-router';

import KirjautumatonApp from './KirjautumatonApp';
import VahvaTunnistusInfoContainer from './vahvatunnistus/VahvaTunnistusInfoContainer';
import VahvaTunnistusLisatiedotContainer from './vahvatunnistus/VahvaTunnistusLisatiedotContainer';
import { VahvaTunnistusValmisPage } from './vahvatunnistus/VahvaTunnistusValmisPage';
import RekisteroidyContainer from './rekisterointi/RekisteroidyContainer';
import { RekisteroidyValmisPage } from './rekisterointi/RekisteroidyValmisPage';
import EmailVerificationContainer from './sahkopostivarmennus/EmailVerificationContainer';
import EmailVerificationErrorContainer from './sahkopostivarmennus/EmailVerificationErrorContainer';
import { EmailVerificationDonePage } from './sahkopostivarmennus/EmailVerificationDonePage';
import { SalasananVaihtoPage } from './SalasananVaihtoPage';

export type RouteType = {
    path: string;
    component: React.ReactNode;
    title: string;
};

export default (
    <Route path="/" component={KirjautumatonApp}>
        <Route
            path="/kayttaja/uudelleenrekisterointi/:locale/:loginToken/:tyosahkopostiosoite/:salasana"
            component={VahvaTunnistusLisatiedotContainer}
        />
        <Route path="/kayttaja/vahvatunnistusinfo/valmis/:locale" component={VahvaTunnistusValmisPage} />
        <Route path="/kayttaja/vahvatunnistusinfo/virhe/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
        <Route path="/kayttaja/vahvatunnistusinfo/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
        <Route path="/kayttaja/sahkopostivarmistus/valmis/:locale" component={EmailVerificationDonePage} />
        <Route path="/kayttaja/sahkopostivarmistus/:locale/:loginToken" component={EmailVerificationContainer} />
        <Route
            path="/kayttaja/sahkopostivarmistus/virhe/:locale/:loginToken/:virhekoodi"
            component={EmailVerificationErrorContainer}
        />
        <Route path="/kayttaja/rekisteroidy" component={RekisteroidyContainer} />
        <Route path="/kayttaja/rekisteroidy/valmis/:locale" component={RekisteroidyValmisPage} />
        <Route path="/kayttaja/salasananvaihto/:locale/:loginToken" component={SalasananVaihtoPage} />
    </Route>
);
