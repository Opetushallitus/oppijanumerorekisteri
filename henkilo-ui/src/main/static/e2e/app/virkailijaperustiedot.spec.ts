import { test, expect } from '@playwright/test';

import { gotoVirkailija } from './locators/virkailija-page';
import { toastWithText } from '../locators';

test.describe('virkailijan perustiedot', () => {
    const oid = '1.2.3.4.66';

    test('renders information', async ({ page }) => {
        const { perustiedot } = await gotoVirkailija(page, oid);
        await expect(perustiedot.sukunimi).toHaveText('suku-nimi');
        await expect(perustiedot.etunimet).toHaveText('etu nimi');
        await expect(perustiedot.oid).toHaveText(oid);
        await expect(perustiedot.username).toHaveText('username');
        await expect(perustiedot.email).toHaveText('etu@suku.fi');
    });

    test('changes username', async ({ page }) => {
        const { buttons, form, perustiedot } = await gotoVirkailija(page, oid);

        await expect(perustiedot.username).toHaveText('username');

        await buttons.muokkaa.click();
        await form.username.fill('uusiname');
        await form.cancel.click();
        await expect(perustiedot.username).toHaveText('username');

        await buttons.muokkaa.click();
        await expect(form.submit).toBeDisabled();
        await expect(form.usernameError).not.toBeAttached();

        await form.username.fill('asd');
        await expect(form.submit).toBeDisabled();
        await expect(form.usernameError).toHaveText(
            'Käyttäjätunnuksen pitää olla vähintään viisi merkkiä pitkä ja saa sisältää kirjaimia (a-z), numeroita, yhdysmerkkejä ("-") ja alaviivoja ("_").'
        );

        await form.username.fill('username');
        await expect(form.submit).toBeDisabled();
        await expect(form.usernameError).not.toBeAttached();

        await form.username.fill('uusiname');
        await form.submit.click();

        await expect(
            toastWithText(
                page,
                'Tallennuksen yhteydessä tapahtui virhe. Tarkista syöttämäsi arvot. Jos virhe toistuu, yritä myöhemmin uudestaan, tai ota yhteyttä järjestelmän ylläpitäjään'
            )
        ).toBeVisible();

        await page.route('/kayttooikeus-service/henkilo/1.2.3.4.66/kayttajatiedot', async (route) => {
            await route.fulfill({
                json: {
                    username: 'uusiname',
                    mfaProvider: null,
                    kayttajaTyyppi: 'VIRKAILIJA',
                    etunimet: 'etu nimi',
                    sukunimi: 'suku-nimi',
                },
            });
        });

        await form.submit.click();
        await expect(perustiedot.username).toHaveText('uusiname');
    });

    test('edits haka-tunnus', async ({ page }) => {
        const { buttons, haka } = await gotoVirkailija(page, oid);

        await page.route('/kayttooikeus-service/henkilo/1.2.3.4.66/hakatunnus', async (route) => {
            await route.fulfill({
                json: [],
            });
        });

        await buttons.haka.click();
        await expect(haka.tunnisteet).toHaveCount(0);

        await page.route('/kayttooikeus-service/henkilo/1.2.3.4.66/hakatunnus', async (route) => {
            await route.fulfill({
                json: ['uusitunnus'],
            });
        });

        await haka.input.fill('uusitunnus');
        await haka.submit.click();

        await expect(haka.tunnisteet).toHaveCount(1);
        await expect(haka.get(1).tunniste).toHaveText('uusitunnus');

        await page.route('/kayttooikeus-service/henkilo/1.2.3.4.66/hakatunnus', async (route) => {
            await route.fulfill({
                json: [],
            });
        });

        await haka.get(1).remove.click();
        await expect(haka.tunnisteet).toHaveCount(0);
    });

    test('changes password', async ({ page }) => {
        const { buttons, password } = await gotoVirkailija(page, oid);

        await buttons.password.click();
        await expect(password.submit).toBeDisabled();
        await expect(password.passwordError).toHaveText('Salasana ei täytä muotovaatimuksia.');
        await expect(password.passwordConfirmedError).not.toBeAttached();

        await password.password.fill('password1!');
        await expect(password.submit).toBeDisabled();
        await expect(password.passwordError).toHaveText('Salasana ei täytä muotovaatimuksia.');
        await expect(password.passwordConfirmedError).toHaveText(
            'Salasanan vahvistus ei täsmää uuden salasanan kanssa.'
        );

        await password.password.fill('asdfgASDFG12345!#$%*');
        await expect(password.submit).toBeDisabled();
        await expect(password.passwordError).not.toBeAttached();
        await expect(password.passwordConfirmedError).toHaveText(
            'Salasanan vahvistus ei täsmää uuden salasanan kanssa.'
        );

        await password.passwordConfirmed.fill('asdfgASDFG12345!#$%*');
        await expect(password.submit).toBeEnabled();
        await expect(password.passwordError).not.toBeAttached();
        await expect(password.passwordConfirmedError).not.toBeAttached();

        await page.route('/kayttooikeus-service/henkilo/1.2.3.4.66/password', async (route) => {
            await route.fulfill({
                status: 200,
            });
        });

        await password.submit.click();
        await expect(toastWithText(page, 'Salasanan tallennus onnistui.')).toBeVisible();
    });

    test('removes user', async ({ page }) => {
        const { buttons } = await gotoVirkailija(page, oid);

        page.on('dialog', async (dialog) => {
            console.log(dialog.message());
            await dialog.accept();
        });

        await buttons.poista.click();
        await buttons.vahvaistaPoisto.click();

        await page.route('/oppijanumerorekisteri-service/henkilo/1.2.3.4.66/access', async (route) => {
            await route.fulfill({
                status: 200,
            });
        });

        await expect(page).toHaveURL(/virkailijahaku/);
    });
});
