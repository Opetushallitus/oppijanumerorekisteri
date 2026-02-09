import { test, expect } from '@playwright/test';

import { toastWithText } from '../locators';

import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';

test.describe('Person page', () => {
    test('Passinumerot', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({
                json: {
                    ...omattiedot,
                    organisaatiot: [
                        {
                            organisaatioOid: '1.2.246.562.10.00000000001',
                            kayttooikeudet: [{ palvelu: 'OPPIJANUMEROREKISTERI', oikeus: 'REKISTERINPITAJA' }],
                        },
                    ],
                },
            });
        });

        let passinumero: string[] = [];
        const postResponses: string[][] = [['testi-passinumero']];
        await page.route(
            '/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.00000007357/passinumerot',
            async (route, request) => {
                const method = await request.method();
                if (method === 'POST') {
                    passinumero = postResponses.pop() || [];
                }
                await route.fulfill({
                    json: passinumero,
                });
            }
        );

        const passinumeroButton = await test.step('Page contains passinumero button', async () => {
            await page.goto('/henkilo-ui/virkailija/1.2.246.562.24.00000007357');
            const button = await page.locator('#passinumero-button');
            expect(button).toHaveText('Hallitse passinumeroita');
            return button;
        });

        const [content, close] = await test.step('Button opens passinumero popup', async () => {
            await passinumeroButton.click();
            const popup = await page.locator('.oph-popup');
            await expect(popup.locator('.oph-popup-title').first()).toHaveText('Passinumerot:');
            return [popup.locator('.oph-popup-content'), popup.locator('.fa-times')];
        });

        await test.step('Form can be edited & submitted', async () => {
            await expect(content.locator('li')).toHaveCount(0);
            await content.locator('button').isDisabled();

            await content.locator('input').fill('testi-passinumero');
            await content.locator('button').click();

            await expect(content.locator('li')).toHaveCount(1);
            await expect(content.locator('li')).toHaveText('testi-passinumero');
        });

        await test.step('Passinumero can be removed', async () => {
            await content.locator('.oph-ds-icon-button-delete').click();
            await expect(content.locator('li')).toHaveCount(0);
        });

        await test.step('Show error dialog on error', async () => {
            await page.route(
                '/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.00000007357/passinumerot',
                (route) => route.abort()
            );
            await content.locator('input').fill('testi-passinumero');
            await content.locator('button').click();
            await expect(toastWithText(page, 'Tapahtui odottamaton virhe')).toBeVisible();
        });

        await test.step('Popup can be closed', async () => {
            await close.click();
            await expect(page.locator('.oph-popup')).toHaveCount(0);
        });
    });
});
