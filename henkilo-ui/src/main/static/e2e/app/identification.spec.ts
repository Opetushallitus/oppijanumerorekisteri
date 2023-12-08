import { test, expect } from '@playwright/test';

import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';
import identifications from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/__oid__/identification/GET.json';

test.describe('identifications', () => {
    test('can be added', async ({ page }) => {
        await page.goto('/henkilo-ui/oppija/1.2.3.4.5');
        await expect(page.locator('#identifications tbody tr')).toHaveCount(2);

        await page.click('[data-test-id="identification-add-button"]');
        await expect(page.locator('[data-test-id="identification-confirm-add"]')).toBeDisabled();

        await page.type('#newIdentifier', 'new@identifier.fi');
        await page.type('#newIdpEntityId', 'sähkö');
        await page.keyboard.press('Enter');

        // frontend should update identifications from microservice
        await page.route(
            '/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.49146995140/identification',
            async (route) => {
                await route.fulfill({
                    json: [
                        ...identifications,
                        {
                            identifier: 'new@identifier.fi',
                            idpEntityId: 'oppijaToken',
                        },
                    ],
                });
            }
        );

        await expect(page.locator('[data-test-id="identification-confirm-add"]')).toBeEnabled();
        await page.click('[data-test-id="identification-confirm-add"]');

        await expect(page.locator('#identifications tbody tr')).toHaveCount(3);
    });

    test('can be removed', async ({ page }) => {
        await page.goto('/henkilo-ui/oppija/1.2.3.4.5');
        await expect(page.locator('#identifications tbody tr')).toHaveCount(2);

        await page.click('#identifications [data-test-id="identification-remove-button"]:first-of-type');

        let deleteCalled = false;
        await page.route(
            `/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.49146995140/identification/${identifications[0].idpEntityId}/${identifications[0].identifier}`,
            async (route) => {
                deleteCalled = true;
                await route.fulfill({
                    json: [identifications[0]],
                });
            }
        );

        // frontend should update identifications from microservice after request
        await page.route(
            '/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.49146995140/identification',
            async (route) => {
                await route.fulfill({
                    json: [identifications[0]],
                });
            }
        );

        await expect(page.locator('#identifications tbody tr')).toHaveCount(1);
        await expect(deleteCalled).toBeTruthy();
    });

    test('do not show without access rights', async ({ page }) => {
        await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
            await route.fulfill({
                json: {
                    ...omattiedot,
                    organisaatiot: [
                        {
                            organisaatioOid: '1.2.246.562.10.00000000001',
                            kayttooikeudet: [{ oikeus: 'YKSILOINNIN_PURKU', palvelu: 'OPPIJANUMEROREKISTERI' }],
                        },
                    ],
                },
            });
        });

        await page.goto('/henkilo-ui/oppija/1.2.3.4.5');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('#identifications')).not.toBeVisible();
    });
});
