import { Page } from '@playwright/test';

export async function gotoVirkailija(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/virkailija/${oid}`);

    return {
        perustiedot: {
            sukunimi: page.getByTestId('sukunimi'),
            etunimet: page.getByTestId('etunimet'),
            oid: page.getByTestId('oid'),
            username: page.getByTestId('username'),
            email: page.getByTestId('email'),
            varmennettava: page.getByTestId('varmennettava'),
            varmentaja: page.getByTestId('varmentaja'),
        },
        form: {
            username: page.getByLabel('Käyttäjätunnus'),
            usernameError: page.getByTestId('input-error-username'),
            submit: page.getByRole('button', { name: 'Tallenna', exact: true }),
            cancel: page.getByRole('button', { name: 'Peruuta' }),
        },
        buttons: {
            muokkaa: page.getByRole('button', { name: 'Muokkaa' }),
            haka: page.getByRole('button', { name: 'Lisää Haka-tunnus' }),
            password: page.getByRole('button', { name: 'Aseta salasana' }),
            poista: page.getByRole('button', { name: 'Poista käyttäjätunnus' }),
            vahvaistaPoisto: page.getByRole('button', { name: 'Vahvista käyttäjätunnuksen poistaminen' }),
        },
        haka: {
            tunnisteet: page.getByRole('dialog', { name: 'Haka-tunnisteet' }).locator('li'),
            get: (i: number) => {
                const row = page.getByLabel('Haka-tunnisteet').locator(`ul li:nth-child(${i})`);
                return {
                    tunniste: row.locator('span'),
                    remove: row.locator('button'),
                };
            },
            input: page.getByLabel('Lisää uusi tunnus'),
            submit: page.getByRole('button', { name: 'Tallenna tunnus' }),
        },
        password: {
            password: page.getByLabel('Uusi salasana'),
            passwordError: page.getByTestId('input-error-password'),
            passwordConfirmed: page.getByLabel('Vahvista salasana'),
            passwordConfirmedError: page.getByTestId('input-error-passwordConfirmed'),
            submit: page
                .getByRole('dialog', { name: 'Aseta salasana' })
                .getByRole('button', { name: 'Aseta salasana' }),
        },
        kayttooikeusForm: {
            valitseOrganisaatio: page.locator('#lisaaKayttooikeusValitseOrganisaatio'),
            valitseRyhma: page.locator('#lisaaKayttooikeusValitseRyhma'),
            alkuPvm: page.getByLabel('Käyttöoikeus alkaa'),
            paattymisPvm: page.getByLabel('Käyttöoikeus päättyy'),
            valitseKayttooikeusOpenModal: page.getByTestId('valitseKayttooikeusOpenModal'),
            valitseModal: page.getByTestId('kayttooikeusryhmaSelect'),
            arvoRajapintakayttaja: page.getByTestId('valittavat-ARVO-rajapintakäyttäjä'),
            valittuNimi: page.getByTestId('kayttooikeusValittuNimi'),
            valittuKuvaus: page.getByTestId('kayttooikeusValittuKuvaus'),
            lisaaHaettaviin: page.getByTestId('kayttooikeusLisaaHaettaviin'),
            valitseModalClose: page.locator('button[title="Close"]'),
            arvoRajapintakayttajaLisatty: page.getByTestId('kayttooikeusSelected-ARVO-rajapintakäyttäjä'),
            arvoRajapintakayttajaPoistaLisatty: page.getByTestId('kayttooikeusRemoveSelected-ARVO-rajapintakäyttäjä'),
            validationWarningBanner: page.getByTestId('kayttooikeusValidationWarningBanner'),
            orgSelectionInvalid: page.getByTestId('kayttooikeusOrgSelectionInvalid'),
            selectedCountMinInvalid: page.getByTestId('kayttooikeusSelectedCountMinInvalid'),
            tallenna: page.getByTestId('kayttooikeusTallenna'),
        },
    };
}
