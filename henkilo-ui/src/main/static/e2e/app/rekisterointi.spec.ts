import { expect, test } from '@playwright/test';

test.describe('virkailijan rekisteröinti', () => {
    test('happy path with username password', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ status: 401 });
        });
        await page.route('/kayttooikeus-service/kutsu/token/tokenpoken', async (route) => {
            if (route.request().method() !== 'POST') {
                await route.fallback();
                return;
            }
            await route.fulfill({ body: 'authtoken' });
        });

        await page.goto('/henkilo-ui/kayttaja/rekisteroidy?temporaryKutsuToken=tokenpoken');
        await page.locator('button').click();

        await expect(page.getByRole('button', { name: 'Tallenna ja jatka virkailijan Opintopolkuun' })).toBeDisabled();

        await page.locator('input[id="kayttajanimi"]').fill('kayttajanimi');
        await page.locator('input[id="password"]').fill('1l3u3cmak0ckrsjodu32tf6c3u!');
        await page.locator('input[id="passwordAgain"]').fill('1l3u3cmak0ckrsjodu32tf6c3u!');

        await page.getByRole('button', { name: 'Tallenna ja jatka virkailijan Opintopolkuun' }).click();

        await expect(page.locator('h2')).toContainText('Rekisteröityminen onnistui');
    });

    test('shows error about duplicate username', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ status: 401 });
        });
        await page.route('/kayttooikeus-service/kutsu/token/tokenpoken', async (route) => {
            if (route.request().method() !== 'POST') {
                await route.fallback();
                return;
            }
            await route.fulfill({
                status: 400,
                json: {
                    messageKey: 'bad_request_illegal_argument',
                    method: 'POST',
                    errorType: 'UsernameAlreadyExistsException',
                    messageParams: [],
                    message: 'Username kayttajanimi already exists',
                    parameters: {},
                    url: 'http://localhost/kayttooikeus-service/kutsu/token/tokenpoken',
                },
            });
        });

        await page.goto('/henkilo-ui/kayttaja/rekisteroidy?temporaryKutsuToken=tokenpoken');
        await page.locator('button').click();

        await page.locator('input[id="kayttajanimi"]').fill('kayttajanimi');
        await page.locator('input[id="password"]').fill('1l3u3cmak0ckrsjodu32tf6c3u!');
        await page.locator('input[id="passwordAgain"]').fill('1l3u3cmak0ckrsjodu32tf6c3u!');
        await page.getByRole('button', { name: 'Tallenna ja jatka virkailijan Opintopolkuun' }).click();

        await expect(page.locator('.oph-popup-content')).toContainText('Valitse toinen käyttäjänimi');
    });
});
