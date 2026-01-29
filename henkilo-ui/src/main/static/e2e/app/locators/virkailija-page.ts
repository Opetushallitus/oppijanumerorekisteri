import { Page } from '@playwright/test';

export async function gotoVirkailija(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/virkailija2/${oid}`);

    return {
        perustiedot: {
            sukunimi: page.getByTestId('sukunimi'),
            etunimet: page.getByTestId('etunimet'),
            oid: page.getByTestId('oid'),
            username: page.getByTestId('username'),
            email: page.getByTestId('email'),
        },
        form: {
            username: page.getByLabel('Käyttäjätunnus'),
            usernameError: page.locator('input[name="username"] + span'),
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
            passwordError: page.locator('input[name="password"] + span'),
            passwordConfirmed: page.getByLabel('Vahvista salasana'),
            passwordConfirmedError: page.locator('input[name="passwordConfirmed"] + span'),
            submit: page
                .getByRole('dialog', { name: 'Aseta salasana' })
                .getByRole('button', { name: 'Aseta salasana' }),
        },
    };
}
