import { expect, Page, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const TESTIAINEISTO_GRETA_OID = '1.2.246.562.98.24707445854';

test.describe('oppija view', () => {
    test('shows basic information for kehittaja', async ({ page }) => {
        await overrideOmattiedot(page, JSON.parse(readFileSync('./e2e/app/omattiedot-kehittaja.json', 'utf8')));
        const oppijaPage = await gotoOppijaView(page, TESTIAINEISTO_GRETA_OID);
        await expect(oppijaPage.etunimet).toHaveText('Greta');
        await expect(oppijaPage.sukunimi).toHaveText('Denimman');
        await expect(oppijaPage.henkilotunnisteet).toBeVisible();
    });

    test('shows basic information for korkeakoulun pääkäyttäjä', async ({ page }) => {
        // HUOM: Tämä testi ei täysin vastaa todellisuutta koska:
        // - mockatut vastaukset ei tee mitään käyttöoikeustarkistuksia
        // - joten 401 vastausten käsittely ei pääse tässä testissä oikeasti tapahtumaan
        // - käytännössä testaa että käli näyttää tai on näyttämättä elementtejä käyttöoikeuksien perusteella
        await overrideOmattiedot(page, JSON.parse(readFileSync('./e2e/app/omattiedot-kk-paakayttaja.json', 'utf8')));
        const oppijaPage = await gotoOppijaView(page, TESTIAINEISTO_GRETA_OID);
        await expect(oppijaPage.etunimet).toHaveText('Greta');
        await expect(oppijaPage.sukunimi).toHaveText('Denimman');
        await expect(oppijaPage.henkilotunnisteet).toHaveCount(0);
    });
});

async function gotoOppijaView(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/oppija/${oid}?permissionCheckService=ATARU`);
    return {
        etunimet: page.locator('div#HENKILO_ETUNIMET span.field'),
        sukunimi: page.locator('div#HENKILO_SUKUNIMI span.field'),
        henkilotunnisteet: page.getByText('Henkilötunnisteet'),
    };
}

async function overrideOmattiedot(page: Page, json: object) {
    await mockRoute(page, '/kayttooikeus-service/henkilo/current/omattiedot', { json });
}

async function mockRoute(page: Page, endpoint: string, options: { body?: string; json?: object }) {
    await page.route(endpoint, async (route) => {
        await route.fulfill(options);
    });
}
