import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';

import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';
import mfasetup from '../../mock-api/src/api/kayttooikeus-service/mfasetup/gauth/setup/GET.json';

const inputToken = async (page: Page, token: string) => {
    await page.locator('input[class="pincode-input-text"]').first().type(token[0]);
    await page.locator('input[class="pincode-input-text"]').nth(1).type(token[1]);
    await page.locator('input[class="pincode-input-text"]').nth(2).type(token[2]);
    await page.locator('input[class="pincode-input-text"]').nth(3).type(token[3]);
    await page.locator('input[class="pincode-input-text"]').nth(4).type(token[4]);
    await page.locator('input[class="pincode-input-text"]').nth(5).type(token[5]);
};

test.skip('mfa setup', () => {
    test('happy flow', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/enable', async (route) => {
            await route.fulfill({ json: true });
        });

        await page.goto('/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
        await page.click('[data-test-id="start-mfa-setup"]');

        await expect(page.locator('[data-test-id="secret-key"]')).toHaveText(mfasetup.secretKey);

        await inputToken(page, '123456');

        await expect(page.locator('[data-test-id="success-notification"] .oph-alert-title')).toContainText(
            'otettu onnistuneesti käyttöön'
        );
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Käytössä');
    });

    test('requires suomifi to be able to continue', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, idpEntityId: 'haka' } });
        });

        await page.goto('/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
        await expect(page.locator('[data-test-id="start-mfa-setup"]')).toBeHidden();
        await expect(page.locator('[data-test-id="login-suomifi"]')).toHaveAttribute(
            'href',
            '/service-provider/saml/logout'
        );
    });

    test('shows error when secret key retrieval fails', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/setup', async (route) => {
            await route.abort('failed');
        });

        await page.goto('/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
        await page.click('[data-test-id="start-mfa-setup"]');

        await expect(page.locator('[data-test-id="setup-error"]')).toHaveText(
            'Kaksivaiheisen tunnistautumisen tietojen haku epäonnistui. Yritä myöhemmin uudelleen.'
        );
    });

    test('shows error when enabling mfa fails', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/enable', async (route) => {
            await route.fulfill({ json: false });
        });

        await page.goto('/omattiedot');
        await page.click('[data-test-id="start-mfa-setup"]');
        await inputToken(page, '123456');
        await expect(page.locator('[data-test-id="token-error"]')).toHaveText(
            'Jotain meni vikaan. Yritä myöhemmin uudelleen.'
        );
    });

    test('shows error when token is invalid', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/enable', async (route) => {
            await route.fulfill({ status: 400, json: { message: 'Invalid token' } });
        });

        await page.goto('/omattiedot');
        await page.click('[data-test-id="start-mfa-setup"]');
        await inputToken(page, '123456');
        await expect(page.locator('[data-test-id="token-error"]')).toHaveText('Väärä vahvistuskoodi');
    });

    test('shows info when already set up', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, mfaProvider: 'GAUTH' } });
        });

        await page.goto('/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Käytössä');
    });
});
