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
            title="TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN"
        />
        <Route
            path="/kayttaja/vahvatunnistusinfo/virhe/:locale/:loginToken"
            component={VahvaTunnistusInfoContainer}
            title="TITLE_VIRHESIVU"
        />
        <Route
            path="/kayttaja/vahvatunnistusinfo/:locale/:loginToken"
            component={VahvaTunnistusInfoContainer}
            title="TITLE_VIRKAILIJA_UUDELLEENTUNNISTAUTUMINEN"
        />
        <Route
            path="/kayttaja/sahkopostivarmistus/:locale/:loginToken"
            component={EmailVerificationContainer}
            title="TITLE_SAHKOPOSTI_VARMISTAMINEN"
        />
        <Route
            path="/kayttaja/sahkopostivarmistus/virhe/:locale/:loginToken/:virhekoodi"
            component={EmailVerificationErrorContainer}
            title="TITLE_VIRHESIVU"
        />
        <Route path="/kayttaja/rekisteroidy" component={RekisteroidyContainer} title="TITLE_REKISTEROINTI" />
        <Route
            path="/kayttaja/salasananvaihto/:locale/:loginToken"
            component={SalasananVaihtoPage}
            title="TITLE_SALASANANVAIHTO"
        />
    </Route>
);
