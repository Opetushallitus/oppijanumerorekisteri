import { expect, test } from '@playwright/test';

test.describe('salasanan vaihto', () => {
    test('validoi kentät', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ status: 401 });
        });

        await page.goto('/henkilo-ui/kayttaja/salasananvaihto/fi/loginToken');
        await page.fill('#currentPassword', 'currentPassword123!');

        await page.fill('#newPassword', 'newPassword123!');
        await page.click('#passwordConfirmation');
        await expect(page.locator('#passwordIsInvalid')).toContainText('Salasana ei täytä muotovaatimuksia.');
        await expect(page.locator('#submit')).toBeDisabled();

        await page.fill('#newPassword', 'currentPassword123!');
        await page.click('#passwordConfirmation');
        await expect(page.locator('#passwordIsInvalid')).toContainText('Salasana ei voi olla vanha salasanasi.');
        await expect(page.locator('#submit')).toBeDisabled();

        await page.fill('#newPassword', 'newPassword123!newPassword123!');
        await page.fill('#passwordConfirmation', 'newPassword123!newPassword123');
        await expect(page.locator('#passwordsDoNotMatch')).toContainText(
            'Salasanan vahvistus ei täsmää uuden salasanan kanssa.'
        );
        await expect(page.locator('#submit')).toBeDisabled();

        await page.fill('#passwordConfirmation', 'newPassword123!newPassword123!');
        await expect(page.locator('#passwordIsInvalid')).toBeEmpty();
        await expect(page.locator('#passwordsDoNotMatch')).toBeEmpty();
        await expect(page.locator('#submit')).toBeEnabled();
    });

    test('näyttää onnistumissivun', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({ status: 401 });
        });

        await page.goto('/henkilo-ui/kayttaja/salasananvaihto/fi/loginToken');
        await page.fill('#currentPassword', 'currentPassword123!');
        await page.fill('#newPassword', 'newPassword123!newPassword123!');
        await page.fill('#passwordConfirmation', 'newPassword123!newPassword123!');
        await page.click('#submit');
        await expect(page.locator('#passwordChangeSuccess')).toContainText('Salasanan vaihto onnistui');
        await expect(page.locator('#returnLink')).toHaveAttribute('href', '/');
    });
});
