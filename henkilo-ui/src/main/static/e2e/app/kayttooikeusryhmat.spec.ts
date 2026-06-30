import { test, expect, Page } from '@playwright/test';

import kayttooikeusryhmat from '../../mock-api/src/api/kayttooikeus-service/kayttooikeusryhma/GET.json' with { type: 'json' };
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

test.describe('kayttooikeusryhmat add', () => {
    const usePostKayttooikeusryhma = (page: Page) =>
        page.route('/kayttooikeus-service/kayttooikeusryhma', async (route) => {
            if (route.request().method() !== 'POST') {
                await route.fallback();
                return;
            }
            route.fulfill({
                body: '123333',
            });
        });

    test('adds kayttooikeusryhma with minimal information', async ({ page }) => {
        await usePostKayttooikeusryhma(page);
        const { addKayttooikeusryhmaLink, lisaaKayttooikeusPage } = await gotoKayttooikeusryhmat(page);
        await expect(addKayttooikeusryhmaLink).toBeVisible();

        const { name, description, palvelutJaKayttooikeudet, save } = await lisaaKayttooikeusPage(page);
        await expect(name.fi).toBeVisible();

        await name.fi.fill('testiryhmä fi');
        await name.sv.fill('testiryhmä sv');
        await name.en.fill('testiryhmä en');

        await description.fi.fill('testiryhmä kuvaus fi');
        await description.sv.fill('testiryhmä kuvaus sv');
        await description.en.fill('testiryhmä kuvaus en');

        await palvelutJaKayttooikeudet.palveluSelect.select('palvelu1');
        await palvelutJaKayttooikeudet.kayttooikeudetSelect.select('jotain');
        await palvelutJaKayttooikeudet.addKayttooikeusButton.click();

        await save.click();

        // the kayttooikeusryhmät list should be visible again
        await expect(addKayttooikeusryhmaLink).toBeVisible();
    });
});
