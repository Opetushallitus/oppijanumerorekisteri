import { test, expect, Page } from '@playwright/test';

import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';
import mfasetup from '../../mock-api/src/api/kayttooikeus-service/mfasetup/gauth/setup/GET.json';
import { toastWithText } from '../locators';

const inputToken = async (page: Page, token: string) => {
    await page.locator('input[class="pincode-input-text"]').first().type(token[0]);
    await page.locator('input[class="pincode-input-text"]').nth(1).type(token[1]);
    await page.locator('input[class="pincode-input-text"]').nth(2).type(token[2]);
    await page.locator('input[class="pincode-input-text"]').nth(3).type(token[3]);
    await page.locator('input[class="pincode-input-text"]').nth(4).type(token[4]);
    await page.locator('input[class="pincode-input-text"]').nth(5).type(token[5]);
};

test.describe('mfa setup', () => {
    test('happy flow', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/enable', async (route) => {
            await route.fulfill({ json: true });
        });

        await page.goto('/henkilo-ui/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
        await page.click('[data-test-id="start-mfa-setup"]');

        await expect(page.locator('[data-test-id="secret-key"]')).toHaveText(mfasetup.secretKey);

        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, mfaProvider: 'GAUTH' } });
        });

        await inputToken(page, '123456');

        await expect(toastWithText(page, 'otettu onnistuneesti käyttöön')).toBeVisible();
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Käytössä');
    });

    test('requires suomifi to be able to enable', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, idpEntityId: 'haka' } });
        });

        await page.goto('/henkilo-ui/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
        await expect(page.locator('[data-test-id="start-mfa-setup"]')).toBeHidden();
        await expect(page.locator('[data-test-id="login-suomifi"]')).toHaveAttribute(
            'href',
            '/service-provider-app/saml/logout'
        );
    });

    test('shows error when secret key retrieval fails', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/setup', async (route) => {
            await route.abort('failed');
        });

        await page.goto('/henkilo-ui/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
        await page.click('[data-test-id="start-mfa-setup"]');

        await expect(page.locator('[data-test-id="setup-error"]')).toHaveText(
            'Kaksivaiheisen tunnistautumisen tietojen haku epäonnistui. Yritä hetken kuluttua uudelleen.'
        );
    });

    test('shows error when enabling mfa fails', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/enable', async (route) => {
            await route.fulfill({ json: false });
        });

        await page.goto('/henkilo-ui/omattiedot');
        await page.click('[data-test-id="start-mfa-setup"]');
        await inputToken(page, '123456');
        await expect(toastWithText(page, 'Jotain meni vikaan. Yritä hetken kuluttua uudelleen.')).toBeVisible();
    });

    test('shows error when token is invalid', async ({ page }) => {
        await page.route('/kayttooikeus-service/mfasetup/gauth/enable', async (route) => {
            await route.fulfill({ status: 400, json: { message: 'Invalid token' } });
        });

        await page.goto('/henkilo-ui/omattiedot');
        await page.click('[data-test-id="start-mfa-setup"]');
        await inputToken(page, '123456');
        await expect(toastWithText(page, 'Väärä vahvistuskoodi')).toBeVisible();
    });

    test('shows info when already set up', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, mfaProvider: 'GAUTH' } });
        });

        await page.goto('/henkilo-ui/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Käytössä');
    });

    test('requires suomifi to be able to disable', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, mfaProvider: 'GAUTH' } });
        });
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, idpEntityId: 'haka' } });
        });

        await page.goto('/henkilo-ui/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
        await expect(page.locator('[data-test-id="disable-mfa"]')).toBeHidden();
        await expect(page.locator('[data-test-id="login-suomifi"]')).toHaveAttribute(
            'href',
            '/service-provider-app/saml/logout'
        );
    });

    test('disables gauth', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: { ...omattiedot, mfaProvider: 'GAUTH' } });
        });
        await page.route('/kayttooikeus-service/mfasetup/gauth/disable', async (route) => {
            await route.fulfill({ json: true });
        });

        await page.goto('/henkilo-ui/omattiedot');
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Käytössä');

        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ json: omattiedot });
        });

        await page.click('[data-test-id="disable-mfa"]');

        await expect(toastWithText(page, 'poistettu käytöstä')).toBeVisible();
        await expect(page.locator('[data-test-id="mfa-status"]')).toHaveText('Ei käytössä');
    });
});
