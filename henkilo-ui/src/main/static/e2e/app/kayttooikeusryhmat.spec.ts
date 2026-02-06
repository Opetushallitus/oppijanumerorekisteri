import { test, expect } from '@playwright/test';

import kayttooikeusryhmat from '../../mock-api/src/api/kayttooikeus-service/kayttooikeusryhma/GET.json';
import { gotoKayttooikeusryhmat } from './locators/kayttooikeusryhmat-page';

test.describe('kayttooikeusryhmat list', () => {
    test('filters by kayttooikeus', async ({ page }) => {
        const { filters } = await gotoKayttooikeusryhmat(page);
        await expect(page.locator('.oph-ds-accordion-header')).toHaveCount(3);

        await page.click('.oph-ds-accordion-header:first-child');
        await expect(page.locator("span:has-text('kuvauds2')")).toBeVisible();

        await page.route(
            '/kayttooikeus-service/kayttooikeusryhma?passiiviset=false&palvelu=GAGA&kayttooikeus=GUGU',
            async (route) => {
                await route.fulfill({ json: [kayttooikeusryhmat[0]] });
            }
        );

        await filters.palveluSelect.select('palvelu');
        await filters.kayttooikeusSelect.select('gugu');

        await expect(page.locator('.oph-ds-accordion-header')).toHaveCount(1);
        await page.click('.oph-ds-accordion-header:first-child');
        await expect(page.locator("span:has-text('kuvaus1')")).toBeVisible();

        await page.click('.oph-ds-select-clearIndicator:first-child');
        await expect(page.locator('.oph-ds-accordion-header')).toHaveCount(3);
    });
});
