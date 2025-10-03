import { expect, Page, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const CURRENT_USER_OID = '1.2.246.562.24.00000000007';
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

test.describe('henkilönäkymä', () => {
    test('basic info shows', async ({ page }) => {
        await overrideOmattiedot(page, JSON.parse(readFileSync('./e2e/app/omattiedot-kehittaja.json', 'utf8')));
        const henkiloPage = await gotoHenkiloView(page, TESTIAINEISTO_GRETA_OID);
        await expect(henkiloPage.etunimet).toHaveText('Greta');
        await expect(henkiloPage.sukunimi).toHaveText('Denimman');
        await expect(henkiloPage.henkilotunnisteet).toBeVisible();
    });

    test('organisation search works as intended', async ({ page }) => {
        const oid = TESTIAINEISTO_GRETA_OID;
        await mockRoute(
            page,
            `/kayttooikeus-service/henkilo/${CURRENT_USER_OID}/organisaatio?piilotaOikeudettomat=true`,
            {
                json: JSON.parse(readFileSync('./e2e/app/omatorganisaatiot.json', 'utf8')),
            }
        );
        const henkiloPage = await gotoHenkiloView(page, oid);
        await expect(henkiloPage.lisaaKayttooikeuksia.section).toBeVisible();
        await henkiloPage.lisaaKayttooikeuksia.input.click();
        await page.keyboard.type('um');
        await expect(henkiloPage.lisaaKayttooikeuksia.suggestions).toHaveCount(2);
        await expect(henkiloPage.lisaaKayttooikeuksia.suggestions.nth(0)).toHaveText(' >Um (KOULUTUSTOIMIJA)');
        await expect(henkiloPage.lisaaKayttooikeuksia.suggestions.nth(1)).toHaveText(' >Lumbridge (KOULUTUSTOIMIJA)');
    });
});

async function gotoHenkiloView(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/virkailija/${oid}`);
    const lisaaKayttooikeuksiaSection = page.getByRole('region', { name: 'Lisää käyttöoikeuksia' });
    return {
        ...henkilonakymaLocators(page),
        lisaaKayttooikeuksia: {
            section: lisaaKayttooikeuksiaSection,
            input: lisaaKayttooikeuksiaSection.locator('input#organisaatio-select'),
            suggestions: lisaaKayttooikeuksiaSection.locator('.oph-ds-select-org-option'),
        },
    };
}

async function gotoOppijaView(page: Page, oid: string) {
    await page.goto(`/henkilo-ui/oppija/${oid}?permissionCheckService=ATARU`);
    return henkilonakymaLocators(page);
}

function henkilonakymaLocators(page: Page) {
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
