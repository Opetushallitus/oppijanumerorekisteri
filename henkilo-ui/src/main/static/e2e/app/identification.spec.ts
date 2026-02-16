import { test, expect } from '@playwright/test';

import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';
import identifications from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/__oid__/identification/GET.json';
import { gotoOppijaView } from './locators/henkilo-page';

test.describe('identifications', () => {
    test.beforeEach(async ({ page }) => {
        await page.route(
            `/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.49146995140/yksilointitiedot`,
            async (route) => {
                await route.fulfill({
                    json: { etunimet: null, sukunimi: null, kutsumanimi: null, sukupuoli: null, yhteystiedot: null },
                });
            }
        );
    });

    test('can be added', async ({ page }) => {
        const oppijaPage = await gotoOppijaView(page, '1.2.246.562.24.49146995140');
        await expect(oppijaPage.henkilotunnisteet.section.locator('tbody tr')).toHaveCount(2);

        const dialog = await oppijaPage.henkilotunnisteet.openLisääHenkilötunnisteDialog();
        await expect(dialog.lisaaHenkilotunnisteButton).toBeDisabled();

        await dialog.identifier.fill('new@identifier.fi');
        await dialog.idpEntityId.fill('sähkö');
        await dialog.idpEntityId.press('Enter');

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

        await expect(dialog.lisaaHenkilotunnisteButton).toBeEnabled();
        await dialog.lisaaHenkilotunnisteButton.click();

        await expect(oppijaPage.henkilotunnisteet.section.locator('tbody tr')).toHaveCount(3);
    });

    test('can be removed', async ({ page }) => {
        const oppijaPage = await gotoOppijaView(page, '1.2.246.562.24.49146995140');
        await expect(oppijaPage.henkilotunnisteet.section.locator('tbody tr')).toHaveCount(2);

        await oppijaPage.henkilotunnisteet.section
            .locator('[data-test-id="identification-remove-button"]')
            .first()
            .click();

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

        await expect(oppijaPage.henkilotunnisteet.section.locator('tbody tr')).toHaveCount(1);
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

        const oppijaPage = await gotoOppijaView(page, '1.2.246.562.24.49146995140');
        await page.waitForLoadState('networkidle');
        await expect(oppijaPage.henkilotunnisteet.section).not.toBeVisible();
    });

    test('eidas is not an accepted henkilötunnistetyyppi', async ({ page }) => {
        const oppijaPage = await gotoOppijaView(page, '1.2.246.562.24.49146995140');
        const dialog = await oppijaPage.henkilotunnisteet.openLisääHenkilötunnisteDialog();

        await dialog.idpEntityId.click();

        const options = page.locator('.oph-ds-select-option');
        await expect(options).toHaveCount(3);

        const optionTexts = await options.allTextContents();
        ['email', 'google', 'oppijatoken'].forEach((identificationType, _) =>
            expect(optionTexts.some((text) => text.toLowerCase().includes(identificationType))).toBe(true)
        );
        expect(optionTexts.some((text) => text.toLowerCase().includes('eidas'))).toBe(false);
    });
});
