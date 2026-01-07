import { test, expect, Page } from '@playwright/test';

import {
    useGetPalvelukayttajaQuery,
    usePostPalvelukayttajaMutation,
    usePutPalvelukayttajaCasPasswordMutation,
    usePutPalvelukayttajaOauth2SecretMutation,
} from '../routes/kayttooikeus';
import { fetchHenkilo, useUpdateHenkiloMutation } from '../routes/oppijanumerorekisteri';

test.describe('jarjestelmatunnus', () => {
    const nimi = 'test tunus 3 ?_-';
    const oid = '1.2.3.4.5555556';
    const kayttajatunnus = 'testtunus3_-';

    const expectClipboardValue = async (page: Page, value: string) => {
        const handle = await page.evaluateHandle(() => navigator.clipboard.readText());
        const clipboardContent = await handle.jsonValue();
        expect(clipboardContent).toEqual(value);
    };

    test.describe('luonti', () => {
        test('creates a new jarjestelmatunnus', async ({ page }) => {
            await usePostPalvelukayttajaMutation(page, oid, nimi);
            await fetchHenkilo(page, oid, nimi);
            await useGetPalvelukayttajaQuery(page, oid, nimi, kayttajatunnus);

            await page.goto('/henkilo-ui/jarjestelmatunnus/luonti');
            await expect(page.locator('button[type=submit]')).toBeDisabled();
            await page.fill('input', nimi);
            await page.click('button[type=submit]');

            await expect(page.locator('div[data-test-id="palvelunnimi"]')).toHaveText(nimi);
            await expect(page.locator('div[data-test-id="castunnus"]')).toHaveText(kayttajatunnus);
            await expect(page.locator('div[data-test-id="oid"]')).toHaveText(oid);
            expect(page.url()).toContain(`/henkilo-ui/jarjestelmatunnus/${oid}`);
        });
    });

    test.describe('edit', () => {
        test('edits name', async ({ page }) => {
            await fetchHenkilo(page, oid, nimi);
            await useGetPalvelukayttajaQuery(page, oid, nimi, kayttajatunnus);

            await page.goto(`/henkilo-ui/jarjestelmatunnus/${oid}`);
            await expect(page.locator('div[data-test-id="palvelunnimi"]')).toHaveText(nimi);

            const newNimi = 'testi tunnari 34';

            await fetchHenkilo(page, oid, newNimi);
            await useUpdateHenkiloMutation(page, oid);

            await page.click('.jarjestelmatunnus-perustiedot button');
            await page.fill('.jarjestelmatunnus-perustiedot input', newNimi);
            await page.click('button[data-test-id="tallenna"]');

            await expect(page.locator('div[data-test-id="palvelunnimi"]')).toHaveText(newNimi);
        });

        test('creates new oauth2 secret', async ({ page, context }) => {
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);

            await fetchHenkilo(page, oid, nimi);
            await useGetPalvelukayttajaQuery(page, oid, nimi, kayttajatunnus);

            await page.goto(`/henkilo-ui/jarjestelmatunnus/${oid}`);
            await expect(page.locator('div[data-test-id="palvelunnimi"]')).toHaveText(nimi);
            await expect(page.locator('.jarjestelmatunnus-edit-oauth2-grid')).not.toBeVisible();

            await usePutPalvelukayttajaOauth2SecretMutation(page, oid);
            await useGetPalvelukayttajaQuery(page, oid, nimi, kayttajatunnus, [
                {
                    clientId: kayttajatunnus,
                    created: '2026-01-01T00:00:00',
                    updated: '2026-01-01T00:00:00',
                    kasittelija: {
                        oid: '1.2.3.4.5',
                        etunimet: 'Kasi',
                        sukunimi: 'Ttelija',
                        kutsumanimi: 'Kasi',
                    },
                },
            ]);

            await page.click('button[data-test-id="oauth2"]');
            await page.click('button[data-test-id="vahvista-oauth2"]');

            await page.click('button[data-test-id="kopioiid"]');
            await expectClipboardValue(page, kayttajatunnus);

            await page.click('button[data-test-id="kopioisecret"]');
            await expectClipboardValue(page, '8Sm%ZQ*Xjz6=9C0e7yBeo79M9B*CfdtUSVw1z369');

            await page.click('button[data-test-id="suljemodaali"]');
            await expect(page.locator('div[data-test-id="oauth2clientid"]')).toHaveText(kayttajatunnus);
            await expect(page.locator('div[data-test-id="kasittelija"]')).toHaveText('Kasi Ttelija');
        });

        test('creates new cas password', async ({ page, context }) => {
            await context.grantPermissions(['clipboard-read', 'clipboard-write']);

            await fetchHenkilo(page, oid, nimi);
            await useGetPalvelukayttajaQuery(page, oid, nimi, kayttajatunnus);

            await page.goto(`/henkilo-ui/jarjestelmatunnus/${oid}`);
            await expect(page.locator('div[data-test-id="palvelunnimi"]')).toHaveText(nimi);

            await usePutPalvelukayttajaCasPasswordMutation(page, oid);

            await page.click('button[data-test-id="cas"]');
            await page.click('button[data-test-id="vahvistacas"]');

            await page.click('button[data-test-id="kopioitunnus"]');
            await expectClipboardValue(page, kayttajatunnus);

            await page.click('button[data-test-id="kopioisalasana"]');
            await expectClipboardValue(page, '3vCHeKkycf3_Y4jVTHe8#X0kF841q+XC569ltC4+');

            await page.click('button[data-test-id="suljemodaali"]');
        });
    });
});
