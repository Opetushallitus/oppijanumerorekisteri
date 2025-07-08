import { test, expect } from '@playwright/test';

test.describe('Perustiedot for yksilöimätön hetuton', () => {
    test('field Sukupuoli can be edited', async ({ page }) => {
        const oid = '1.2.246.562.24.00001000000';
        let henkilo = {
            oidHenkilo: oid,
            hetu: null,
            kaikkiHetut: [],
            passivoitu: false,
            etunimet: 'etunimi',
            kutsumanimi: 'etunimi',
            sukunimi: 'sukunimi',
            aidinkieli: null,
            asiointiKieli: null,
            kansalaisuus: [],
            kasittelijaOid: '1.2.246.562.24.55640294153',
            syntymaaika: null,
            sukupuoli: null,
            kotikunta: null,
            oppijanumero: null,
            turvakielto: false,
            eiSuomalaistaHetua: false,
            yksiloity: false,
            yksiloityVTJ: false,
            yksilointiYritetty: false,
            duplicate: false,
            created: 1750332314272,
            modified: 1750332314272,
            vtjsynced: null,
            yhteystiedotRyhma: [],
            yksilointivirheet: [],
            passinumerot: [],
            kielisyys: [],
        };
        await page.route(`/oppijanumerorekisteri-service/henkilo/${oid}`, async (route) => {
            if (route.request().method() !== 'GET') {
                await route.fallback();
            } else {
                await route.fulfill({ json: henkilo });
            }
        });
        await page.route(`/oppijanumerorekisteri-service/henkilo`, async (route) => {
            if (route.request().method() !== 'PUT') {
                await route.fallback();
            } else {
                henkilo = route.request().postDataJSON();
                await route.fulfill({ json: henkilo.oidHenkilo });
            }
        });
        await page.goto('/henkilo-ui/oppija/1.2.246.562.24.00001000000');
        expect(await page.getByTestId('HENKILO_SUKUPUOLI_value').textContent()).toEqual('');
        await page.locator('.henkiloViewButtons').first().getByRole('button', { name: 'Muokkaa' }).first().click();
        await page.locator('#HENKILO_SUKUPUOLI').getByRole('combobox').click();
        await page.locator('#HENKILO_SUKUPUOLI').getByText('nainen').click();
        await page.getByRole('button', { name: 'Tallenna' }).first().click();
        expect(await page.getByTestId('HENKILO_SUKUPUOLI_value').textContent()).toEqual('nainen');
    });
});
