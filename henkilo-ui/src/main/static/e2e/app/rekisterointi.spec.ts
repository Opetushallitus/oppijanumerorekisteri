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

        await page.locator('input[name="kayttajanimi"]').fill('kayttajanimi');
        await page.locator('input[name="password"]').fill('1l3u3cmak0ckrsjodu32tf6c3u!');
        await page.locator('input[name="passwordAgain"]').fill('1l3u3cmak0ckrsjodu32tf6c3u!');

        await page.getByRole('button', { name: 'Tallenna ja jatka virkailijan Opintopolkuun' }).click();

        await expect(page.locator('h2')).toContainText('Rekisteröityminen onnistui');
    });
});
