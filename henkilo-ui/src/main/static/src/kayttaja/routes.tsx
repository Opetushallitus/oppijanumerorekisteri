import * as React from 'react';
import { Route } from 'react-router';

import KirjautumatonApp from './KirjautumatonApp';
import VahvaTunnistusInfoContainer from './vahvatunnistus/VahvaTunnistusInfoContainer';
import VahvaTunnistusLisatiedotContainer from './vahvatunnistus/VahvaTunnistusLisatiedotContainer';
import RekisteroidyContainer from './rekisterointi/RekisteroidyContainer';
import EmailVerificationContainer from './sahkopostivarmennus/EmailVerificationContainer';
import EmailVerificationErrorContainer from './sahkopostivarmennus/EmailVerificationErrorContainer';
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
        <Route path="/kayttaja/vahvatunnistusinfo/virhe/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
        <Route path="/kayttaja/vahvatunnistusinfo/:locale/:loginToken" component={VahvaTunnistusInfoContainer} />
        <Route path="/kayttaja/sahkopostivarmistus/:locale/:loginToken" component={EmailVerificationContainer} />
        <Route
            path="/kayttaja/sahkopostivarmistus/virhe/:locale/:loginToken/:virhekoodi"
            component={EmailVerificationErrorContainer}
        />
        <Route path="/kayttaja/rekisteroidy" component={RekisteroidyContainer} />
        <Route path="/kayttaja/salasananvaihto/:locale/:loginToken" component={SalasananVaihtoPage} />
    </Route>
);
