import * as React from 'react';
import { Route } from 'react-router';

import KirjautumatonApp from './KirjautumatonApp';
import VahvaTunnistusInfoContainer from './rekisterointi/VahvaTunnistusInfoContainer';
import RekisteroidyContainer from './rekisterointi/RekisteroidyContainer';
import VahvaTunnistusLisatiedotContainer from './rekisterointi/VahvaTunnistusLisatiedotContainer';
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
            path="/kirjautumaton/uudelleenrekisterointi/:locale/:loginToken/:tyosahkopostiosoite/:salasana"
            component={VahvaTunnistusLisatiedotContainer}
            title="TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN"
        />
        <Route
            path="/kirjautumaton/vahvatunnistusinfo/virhe/:locale/:loginToken"
            component={VahvaTunnistusInfoContainer}
            title="TITLE_VIRHESIVU"
        />
        <Route
            path="/kirjautumaton/vahvatunnistusinfo/:locale/:loginToken"
            component={VahvaTunnistusInfoContainer}
            title="TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN"
        />
        <Route
            path="/kirjautumaton/sahkopostivarmistus/:locale/:loginToken"
            component={EmailVerificationContainer}
            title="TITLE_SAHKOPOSTI_VARMISTAMINEN"
        />
        <Route
            path="/kirjautumaton/sahkopostivarmistus/virhe/:locale/:loginToken/:virhekoodi"
            component={EmailVerificationErrorContainer}
            title="TITLE_VIRHESIVU"
        />
        <Route path="/kirjautumaton/rekisteroidy" component={RekisteroidyContainer} title="TITLE_REKISTEROINTI" />
        <Route
            path="/kirjautumaton/salasananvaihto/:locale/:loginToken"
            component={SalasananVaihtoPage}
            title="TITLE_SALASANANVAIHTO"
        />
    </Route>
);
