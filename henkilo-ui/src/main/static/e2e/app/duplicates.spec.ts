import { test, expect, Page } from '@playwright/test';

import omattiedot from '../../mock-api/src/api/kayttooikeus-service/henkilo/current/omattiedot/GET.json';
import duplicates from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/__oid__/duplicates/GET.json';
import link from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/__oid__/link/POST.json';
import main from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/__oid__/GET.json';
import type { HenkiloDuplicate } from '../../src/types/domain/oppijanumerorekisteri/HenkiloDuplicate';

type Grouped = {
    yksiloityVtj: HenkiloDuplicate[];
    yksiloityEidas: HenkiloDuplicate[];
    yksiloity: HenkiloDuplicate[];
    yksiloimaton: HenkiloDuplicate[];
};

const groupedDuplicates: Grouped = {
    yksiloityVtj: [],
    yksiloityEidas: [],
    yksiloity: [],
    yksiloimaton: [],
};

(duplicates as HenkiloDuplicate[]).forEach((d) => {
    if (d.yksiloityVTJ) {
        groupedDuplicates.yksiloityVtj.push(d);
    } else if (d.yksiloityEidas) {
        groupedDuplicates.yksiloityEidas.push(d);
    } else if (d.yksiloity) {
        groupedDuplicates.yksiloity.push(d);
    } else {
        groupedDuplicates.yksiloimaton.push(d);
    }
});

const routeOmattiedotWithoutRoles = async (page: Page) => {
    await page.route('/kayttooikeus-service/henkilo/current/omattiedot', async (route) => {
        await route.fulfill({
            json: {
                ...omattiedot,
                organisaatiot: [
                    {
                        organisaatioOid: '1.2.246.562.10.00000000001',
                        kayttooikeudet: [],
                    },
                ],
            },
        });
    });
};

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

const routeMainWithYksilointi = async (
    page: Page,
    yksiloity: boolean,
    yksiloityVTJ: boolean,
    yksiloityEidas: boolean
) => {
    await page.route('/oppijanumerorekisteri-service/henkilo/1.2.3.4.5', async (route) => {
        await route.fulfill({
            json: {
                ...main,
                yksiloity,
                yksiloityVTJ,
                yksiloityEidas,
                hetu: yksiloityVTJ ? '111111-1111' : null,
                eidasTunnisteet: yksiloityEidas
                    ? [{ tunniste: 'DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5' }]
                    : [],
            },
        });
    });
};

test.describe('Hae duplikaatit', () => {
    test('linking non-yksiloity duplicate to main happy path', async ({ page }) => {
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await page.click(`[data-test-id="link-duplicate-from-${groupedDuplicates.yksiloimaton?.[1].oidHenkilo}"]`);
        await page.click(`[data-test-id="confirm-force-link"]`);
        await expect(page.locator('.oph-ds-toasts')).toHaveText('Henkilöiden linkittäminen onnistui');
    });

    test('linking non-yksiloity main to duplicate happy path', async ({ page }) => {
        await routeMainWithYksilointi(page, false, false, false);
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await page.click(`[data-test-id="link-main-to-${groupedDuplicates.yksiloityVtj?.[1].oidHenkilo}"]`);
        await page.click(`[data-test-id="confirm-force-link"]`);
        await expect(page.locator('.oph-ds-toasts')).toHaveText('Henkilöiden linkittäminen onnistui');
    });

    test('linking duplicate to main is enabled only for yksiloimaton', async ({ page }) => {
        await routeOmattiedotWithoutRoles(page);
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await Promise.all(
            groupedDuplicates.yksiloity.map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeDisabled();
            })
        );
        await Promise.all(
            groupedDuplicates.yksiloityVtj.map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeDisabled();
            })
        );
        await Promise.all(
            (groupedDuplicates.yksiloityEidas ?? []).map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeDisabled();
            })
        );
        await Promise.all(
            groupedDuplicates.yksiloimaton.map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeEnabled();
            })
        );
    });

    test('force linking duplicate to main is enabled for yksiloity', async ({ page }) => {
        await routeOmattiedotWithPurkuRole(page);
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await Promise.all(
            groupedDuplicates.yksiloity.map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeEnabled();
            })
        );
        await Promise.all(
            groupedDuplicates.yksiloityVtj.map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeDisabled();
            })
        );
        await Promise.all(
            (groupedDuplicates.yksiloityEidas ?? []).map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeDisabled();
            })
        );
        await Promise.all(
            groupedDuplicates.yksiloimaton.map(async (duplicate) => {
                const locator = page.locator(`[data-test-id="link-duplicate-from-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeEnabled();
            })
        );
    });

    test('linking main to duplicate is enabled for yksiloimaton', async ({ page }) => {
        await routeMainWithYksilointi(page, false, false, false);
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await Promise.all(
            duplicates.map(async (duplicate) => {
                await page.waitForSelector(`[data-test-id="link-main-to-${duplicate.oidHenkilo}"]`);
                const locator = page.locator(`[data-test-id="link-main-to-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeEnabled();
            })
        );
    });

    test('force linking main to duplicate is enabled for yksiloity with purku role', async ({ page }) => {
        await routeOmattiedotWithPurkuRole(page);
        await routeMainWithYksilointi(page, true, false, false);
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await Promise.all(
            duplicates.map(async (duplicate) => {
                await page.waitForSelector(`[data-test-id="link-main-to-${duplicate.oidHenkilo}"]`);
                const locator = page.locator(`[data-test-id="link-main-to-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeEnabled();
            })
        );
    });

    test('force linking main to duplicate is disabled for yksiloityVtj', async ({ page }) => {
        await routeOmattiedotWithPurkuRole(page);
        await routeMainWithYksilointi(page, false, true, false);
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await Promise.all(
            duplicates.map(async (duplicate) => {
                await page.waitForSelector(`[data-test-id="link-main-to-${duplicate.oidHenkilo}"]`);
                const locator = page.locator(`[data-test-id="link-main-to-${duplicate.oidHenkilo}"]`);
                await expect(locator).toBeDisabled();
            })
        );
    });

    test('force linking yksiloity duplicate to main happy path', async ({ page }) => {
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await page.click(`[data-test-id="link-duplicate-from-${groupedDuplicates.yksiloimaton?.[1].oidHenkilo}"]`);
        await page.click(`[data-test-id="confirm-force-link"]`);
        await expect(page.locator('.oph-ds-toasts')).toHaveText('Henkilöiden linkittäminen onnistui');
    });

    test('force linking yksiloity main to duplicate happy path', async ({ page }) => {
        await routeOmattiedotWithPurkuRole(page);
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit');
        await page.click(`[data-test-id="link-main-to-${groupedDuplicates.yksiloityVtj?.[1].oidHenkilo}"]`);
        await page.click(`[data-test-id="confirm-force-link"]`);
        await expect(page.locator('.oph-ds-toasts')).toHaveText('Henkilöiden linkittäminen onnistui');
    });

    test('sends permission service header', async ({ page }) => {
        await page.route('/oppijanumerorekisteri-service/henkilo/1.2.3.4.5/link', async (route) => {
            expect(route.request().headers()['external-permission-service']).toEqual('ATARU');
            await route.fulfill({
                json: link,
            });
        });
        await page.goto('/henkilo-ui/virkailija/1.2.3.4.5/duplikaatit?permissionCheckService=ATARU');
        await page.click(`[data-test-id="link-duplicate-from-${groupedDuplicates.yksiloimaton?.[1].oidHenkilo}"]`);
        await page.click(`[data-test-id="confirm-force-link"]`);
        await expect(page.locator('.oph-ds-toasts')).toHaveText('Henkilöiden linkittäminen onnistui');
    });
});
