import { expect, Page, Route, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

const CURRENT_USER_OID = '1.2.246.562.24.00000000007';
const TESTIAINEISTO_GRETA_OID = '1.2.246.562.98.24707445854';
const EIDAS_LEON_ELIAS_GERMANY_OID = '1.2.246.562.24.92212175391';

test.describe('oppija view', () => {
    test('shows basic information for kehittaja', async ({ page }) => {
        await overrideOmattiedot(page, JSON.parse(readFileSync('./e2e/app/omattiedot-kehittaja.json', 'utf8')));
        const oppijaPage = await gotoOppijaView(page, TESTIAINEISTO_GRETA_OID);
        await expect(oppijaPage.perustiedot.etunimet).toHaveText('Greta');
        await expect(oppijaPage.perustiedot.sukunimi).toHaveText('Denimman');
        await expect(oppijaPage.henkilotunnisteet).toBeVisible();
    });

    test('shows basic information for korkeakoulun pääkäyttäjä', async ({ page }) => {
        // HUOM: Tämä testi ei täysin vastaa todellisuutta koska:
        // - mockatut vastaukset ei tee mitään käyttöoikeustarkistuksia
        // - joten 401 vastausten käsittely ei pääse tässä testissä oikeasti tapahtumaan
        // - käytännössä testaa että käli näyttää tai on näyttämättä elementtejä käyttöoikeuksien perusteella
        await overrideOmattiedot(page, JSON.parse(readFileSync('./e2e/app/omattiedot-kk-paakayttaja.json', 'utf8')));
        const oppijaPage = await gotoOppijaView(page, TESTIAINEISTO_GRETA_OID);
        await expect(oppijaPage.perustiedot.etunimet).toHaveText('Greta');
        await expect(oppijaPage.perustiedot.sukunimi).toHaveText('Denimman');
        await expect(oppijaPage.henkilotunnisteet).toHaveCount(0);
    });
});

test.describe('henkilönäkymä', () => {
    test('basic info shows', async ({ page }) => {
        await overrideOmattiedot(page, JSON.parse(readFileSync('./e2e/app/omattiedot-kehittaja.json', 'utf8')));
        const henkiloPage = await gotoHenkiloView(page, TESTIAINEISTO_GRETA_OID);
        await expect(henkiloPage.perustiedot.etunimet).toHaveText('Greta');
        await expect(henkiloPage.perustiedot.sukunimi).toHaveText('Denimman');
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

    test('shows eidas', async ({ page }) => {
        const oid = EIDAS_LEON_ELIAS_GERMANY_OID;
        await mockRoute(page, `/oppijanumerorekisteri-service/henkilo/${oid}`, {
            json: {
                oidHenkilo: oid,
                hetu: null,
                kaikkiHetut: [],
                passivoitu: false,
                etunimet: 'Leon Elias',
                kutsumanimi: 'Leon Elias',
                sukunimi: 'Germany',
                aidinkieli: null,
                asiointiKieli: null,
                kansalaisuus: [],
                kasittelijaOid: CURRENT_USER_OID,
                syntymaaika: '1981-02-06',
                sukupuoli: null,
                kotikunta: null,
                oppijanumero: oid,
                turvakielto: false,
                eiSuomalaistaHetua: true,
                yksiloity: false,
                yksiloityVTJ: false,
                yksilointiYritetty: false,
                yksiloityEidas: true,
                eidasTunnisteet: [
                    { tunniste: 'DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5' },
                ],
                duplicate: false,
                created: 1734097904137,
                modified: 1750934803202,
                vtjsynced: null,
                yhteystiedotRyhma: [],
                yksilointivirheet: [],
                passinumerot: [],
                kielisyys: [],
                modifiedAt: '2025-06-26T13:46:43.202+03:00',
                createdAt: '2024-12-13T15:51:44.137+02:00',
            },
        });
        await mockRoute(page, `/oppijanumerorekisteri-service/henkilo/${oid}/master`, {
            json: {
                id: 166132533,
                etunimet: 'Leon Elias',
                syntymaaika: '1981-02-06',
                kuolinpaiva: null,
                hetu: null,
                kaikkiHetut: [],
                kutsumanimi: 'Leon Elias',
                oidHenkilo: oid,
                oppijanumero: oid,
                sukunimi: 'Germany',
                sukupuoli: null,
                kotikunta: null,
                turvakielto: false,
                eiSuomalaistaHetua: true,
                passivoitu: false,
                yksiloity: false,
                yksiloityVTJ: false,
                yksilointiYritetty: false,
                yksiloityEidas: true,
                eidasTunnisteet: [
                    { tunniste: 'DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5' },
                ],
                duplicate: false,
                created: 1734097904137,
                modified: 1750934803202,
                vtjsynced: null,
                kasittelijaOid: CURRENT_USER_OID,
                asiointiKieli: null,
                aidinkieli: null,
                kansalaisuus: [],
                yhteystiedotRyhma: [],
                passinumerot: [],
                kielisyys: [],
            },
        });
        await mockRoute(page, `/oppijanumerorekisteri-service/henkilo/${oid}/slaves`, { json: [] });
        await mockRoute(page, `/oppijanumerorekisteri-service/henkilo/${oid}/yksilointitiedot`, {
            json: { etunimet: null, sukunimi: null, kutsumanimi: null, sukupuoli: null, yhteystiedot: null },
        });
        await mockRoute(page, `/oppijanumerorekisteri-service/henkilo/${oid}/identification`, {
            json: [
                {
                    idpEntityId: 'eidas',
                    identifier: 'DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5',
                },
            ],
        });
        await mockRoute(page, `/kayttooikeus-service/henkilo/${oid}/kayttajatiedot`, {
            status: 404,
        });
        await mockRoute(page, `/kayttooikeus-service/henkilo/${oid}/linkitykset`, {
            json: { henkiloVarmennettavas: [], henkiloVarmentajas: [] },
        });
        await mockRoute(page, `/kayttooikeus-service/kayttooikeusryhma/henkilo/${oid}`, {
            json: [],
        });
        await mockRoute(page, `/kayttooikeus-service/kayttooikeusanomus/${oid}?activeOnly=true`, {
            json: [],
        });
        await mockRoute(page, `/kayttooikeus-service/henkilo/${oid}/organisaatiohenkilo`, {
            json: [],
        });
        await mockRoute(page, `/kayttooikeus-service/henkilo/${oid}/organisaatio?piilotaOikeudettomat=true`, {
            json: JSON.parse(readFileSync('./e2e/app/omatorganisaatiot.json', 'utf8')),
        });
        const henkiloPage = await gotoHenkiloView(page, oid);
        await expect(henkiloPage.perustiedot.etunimet).toHaveText('Leon Elias');
        await expect(henkiloPage.perustiedot.otsikko).toHaveText('Perustiedot (yksilöity eIDAS-tunnisteella)');
        await expect(henkiloPage.perustiedot.eidas).toHaveText(
            'DE/FI/366193B0E55D436B494769486A9284D04E0A1DCFDBF8B9EDA63E5BF4C3CFE6F5'
        );
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
    const perustiedot = page.getByRole('region', { name: 'Perustiedot' });
    return {
        perustiedot: {
            otsikko: perustiedot.getByRole('heading'),
            etunimet: perustiedot.locator('div#HENKILO_ETUNIMET span.field'),
            sukunimi: perustiedot.locator('div#HENKILO_SUKUNIMI span.field'),
            eidas: perustiedot.locator('div#HENKILO_EIDASTUNNISTEET span.field'),
        },
        henkilotunnisteet: page.getByRole('region', { name: 'Henkilötunnisteet' }),
    };
}

async function overrideOmattiedot(page: Page, json: object) {
    await mockRoute(page, '/kayttooikeus-service/henkilo/current/omattiedot', { json });
}

async function mockRoute(page: Page, endpoint: string, options: Parameters<Route['fulfill']>[0]) {
    await page.route(endpoint, async (route) => {
        await route.fulfill(options);
    });
}
