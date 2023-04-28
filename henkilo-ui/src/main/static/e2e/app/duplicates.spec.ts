import { test, expect } from 'playwright-test-coverage';
import { Page } from '@playwright/test';
import R from 'ramda';

import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';
import duplicates from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/1.2.3.4.5/duplicates/GET.json';
import link from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/1.2.3.4.5/link/POST.json'

const groupedDuplicates = R.groupBy((h) => {
    return h.yksiloityVTJ ? 'yksiloityVtj' : h.yksiloity ? 'yksiloity' : 'yksiloimaton';
}, duplicates);

const routeOmattiedotWithPurkuRole = async (page: Page) => {
    await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
        await route.fulfill({
            json: {
                ...omattiedot,
                organisaatiot: [
                    ...omattiedot.organisaatiot,
                    {
                        organisaatioOid: '1.2.246.562.10.00000000001',
                        kayttooikeudet: [{ oikeus: 'YKSILOINNIN_PURKU', palvelu: 'OPPIJANUMEROREKISTERI' }],
                    },
                ],
            },
        });
    });
};

test.describe('Hae duplikaatit', () => {
    test('linking non-yksiloity happy path', async ({ page }) => {
        await page.goto('/virkailija/1.2.3.4.5/duplikaatit');
        await page.click(`[data-test-id="check-duplicate-${groupedDuplicates.yksiloimaton[0].oidHenkilo}"]`);
        await page.click(`[data-test-id="check-duplicate-${groupedDuplicates.yksiloimaton[1].oidHenkilo}"]`);
        await page.click('[data-test-id="yhdista-button"]');
        await expect(page.locator('[data-test-id="LINKED_DUPLICATES_SUCCESS"] .oph-alert-title')).toHaveText(
            'Henkilöiden linkittäminen onnistui'
        );
    });

    test('linking is enabled only for yksiloimaton', async ({ page }) => {
        await page.goto('/virkailija/1.2.3.4.5/duplikaatit');
        groupedDuplicates.yksiloity.forEach(async (duplicate) => {
            const locator = page.locator(`[data-test-id="check-duplicate-${duplicate.oidHenkilo}"]`);
            await expect(locator).toBeDisabled();
        });
        groupedDuplicates.yksiloityVtj.forEach(async (duplicate) => {
            const locator = page.locator(`[data-test-id="check-duplicate-${duplicate.oidHenkilo}"]`);
            await expect(locator).toBeDisabled();
        });
        groupedDuplicates.yksiloimaton.forEach(async (duplicate) => {
            const locator = page.locator(`[data-test-id="check-duplicate-${duplicate.oidHenkilo}"]`);
            await expect(locator).toBeEnabled();
        });
        await expect(page.locator('[data-test-id="force-link-button"]')).toBeHidden();
    });

    test('force linking is enabled for yksiloity', async ({ page }) => {
        await routeOmattiedotWithPurkuRole(page);
        await page.goto('/virkailija/1.2.3.4.5/duplikaatit');
        groupedDuplicates.yksiloity.forEach(async (duplicate) => {
            const locator = page.locator(`[data-test-id="check-duplicate-${duplicate.oidHenkilo}"]`);
            await expect(locator).toBeEnabled();
        });
        groupedDuplicates.yksiloityVtj.forEach(async (duplicate) => {
            const locator = page.locator(`[data-test-id="check-duplicate-${duplicate.oidHenkilo}"]`);
            await expect(locator).toBeDisabled();
        });
        groupedDuplicates.yksiloimaton.forEach(async (duplicate) => {
            const locator = page.locator(`[data-test-id="check-duplicate-${duplicate.oidHenkilo}"]`);
            await expect(locator).toBeEnabled();
        });
        await expect(page.locator('[data-test-id="force-link-button"]')).toBeHidden();
    });

    test('force linking yksiloity shows confirmation modal', async ({ page }) => {
        await routeOmattiedotWithPurkuRole(page);
        await page.goto('/virkailija/1.2.3.4.5/duplikaatit');
        await page.click(`[data-test-id="check-duplicate-${groupedDuplicates.yksiloity[0].oidHenkilo}"]`);
        await page.click('[data-test-id="force-link-button"]');
        await page.click('[data-test-id="confirm-force-link"]');
        await expect(page.locator('[data-test-id="LINKED_DUPLICATES_SUCCESS"] .oph-alert-title')).toHaveText(
            'Henkilöiden linkittäminen onnistui'
        );
    });

    test('sends permission service header', async ({ page }) => {
        await page.route('/oppijanumerorekisteri-service/henkilo/1.2.3.4.5/link', async (route) => {
            expect(route.request().headers()['external-permission-service']).toEqual('ATARU');
            await route.fulfill({
                json: link,
            });
        })
        await page.goto('/virkailija/1.2.3.4.5/duplikaatit?permissionCheckService=ATARU');
        await page.click(`[data-test-id="check-duplicate-${groupedDuplicates.yksiloimaton[0].oidHenkilo}"]`);
        await page.click(`[data-test-id="check-duplicate-${groupedDuplicates.yksiloimaton[1].oidHenkilo}"]`);
        await page.click('[data-test-id="yhdista-button"]');
        await expect(page.locator('[data-test-id="LINKED_DUPLICATES_SUCCESS"] .oph-alert-title')).toHaveText(
            'Henkilöiden linkittäminen onnistui'
        );
    });
});
