import { test, expect } from '@playwright/test';

import kayttooikeusryhmat from '../../mock-api/src/api/kayttooikeus-service/kayttooikeusryhma/GET.json';

test.describe('kayttooikeusryhmat list', () => {
    test('filters by kayttooikeus', async ({ page }) => {
        await page.goto('/henkilo-ui/kayttooikeusryhmat');
        await expect(page.locator('.oph-ds-accordion-header')).toHaveCount(3);

        await page.click('.oph-ds-accordion-header:first-child');
        await expect(page.locator("span:has-text('kuvauds2')")).toBeVisible();

        await page.route(
            '/kayttooikeus-service/kayttooikeusryhma?passiiviset=false&palvelu=GAGA&kayttooikeus=GUGU',
            async (route) => {
                await route.fulfill({ json: [kayttooikeusryhmat[0]] });
            }
        );

        await page.type('#react-select-2-input', 'palvelu');
        await page.keyboard.press('Enter');

        await expect(page.locator('#react-select-3-input')).toBeEditable();
        await page.type('#react-select-3-input', 'gugu');
        await expect(page.getByText('Gugutus')).toBeVisible();
        await page.keyboard.press('Enter');

        await expect(page.locator('.oph-ds-accordion-header')).toHaveCount(1);
        await page.click('.oph-ds-accordion-header:first-child');
        await expect(page.locator("span:has-text('kuvaus1')")).toBeVisible();

        await page.click('.oph-ds-select-clearIndicator:first-child');
        await expect(page.locator('.oph-ds-accordion-header')).toHaveCount(3);
    });
});
