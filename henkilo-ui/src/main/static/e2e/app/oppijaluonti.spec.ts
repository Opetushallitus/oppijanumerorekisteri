import { test, expect, Page } from '@playwright/test';
import { gotoOppijaLuonti } from './locators/oppijaluonti-page';
import { CreateHenkiloRequest } from '../../src/api/oppijanumerorekisteri';

test.describe('oppija/luonti', () => {
    const testPerson: CreateHenkiloRequest = {
        hetu: '110902E9074',
        etunimet: 'Testi Test',
        kutsumanimi: 'Testi',
        sukunimi: 'Testaaja',
    };

    test('displays buttons to access a form for ssn or without ssn', async ({ page }) => {
        const { withSsn, withoutSsn } = await gotoOppijaLuonti(page);
        await expect(withSsn).toBeVisible();
        await expect(withoutSsn).toBeVisible();
    });

    test.describe('with ssn', () => {
        test('shows form', async ({ page }) => {
            const form = await (await gotoOppijaLuonti(page)).gotoWithSsn();

            await expect(form.personalIdentificationNumber).toBeVisible();
            await expect(form.firstNames).toBeVisible();
            await expect(form.displayName).toBeVisible();
            await expect(form.lastName).toBeVisible();
            await expect(form.submit).toBeVisible();
            await expect(form.submit).toBeDisabled();
            await expect(form.clear).toBeVisible();
            await expect(form.cancel).toBeVisible();
        });

        test('cancel', async ({ page }) => {
            const { withoutSsn, withSsn, gotoWithSsn } = await gotoOppijaLuonti(page);
            const form = await gotoWithSsn();
            await form.cancel.click();
            await expect(form.personalIdentificationNumber).not.toBeVisible();
            await expect(withSsn).toBeVisible();
            await expect(withoutSsn).toBeVisible();
        });

        const enterPageAndFillForm = async (page: Page, person = testPerson) => {
            const form = await (await gotoOppijaLuonti(page)).gotoWithSsn();

            await form.personalIdentificationNumber.fill(person.hetu);
            await form.firstNames.fill(person.etunimet);
            await form.displayName.fill(person.kutsumanimi);
            await form.lastName.fill(person.sukunimi);

            return form;
        };

        test('clears form', async ({ page }) => {
            const form = await enterPageAndFillForm(page);

            await form.clear.click();

            await expect(form.personalIdentificationNumber).not.toHaveValue(testPerson.hetu);
            await expect(form.personalIdentificationNumber).toHaveValue('');
            await expect(form.firstNames).not.toHaveValue(testPerson.etunimet);
            await expect(form.firstNames).toHaveValue('');
            await expect(form.displayName).not.toHaveValue(testPerson.kutsumanimi);
            await expect(form.displayName).toHaveValue('');
            await expect(form.lastName).not.toHaveValue(testPerson.sukunimi);
            await expect(form.lastName).toHaveValue('');
        });

        test('search with an existing person', async ({ page }) => {
            const form = await enterPageAndFillForm(page, testPerson);

            await form.submit.click();

            await expect(form.existsError).not.toBeVisible();
            await expect(form.existsSuccess).toBeVisible();
            expect(await form.existsSuccess.innerText()).toContain('Oppijanumeron haku onnistui');
        });

        test('search with an invalid personal identification number', async ({ page }) => {
            const form = await enterPageAndFillForm(page, { ...testPerson, hetu: '010108A9239' });

            await form.submit.click();

            await expect(form.existsError).toBeVisible();
            expect(await form.existsError.innerText()).toContain('Ristiriitaiset henkilötiedot');
        });

        test("search with non-existent person's personal identification number", async ({ page }) => {
            const form = await enterPageAndFillForm(page, { ...testPerson, hetu: '121212-1111' });

            await form.submit.click();

            await expect(form.existsError).toBeVisible();
            expect(await form.existsError.innerText()).toContain('Henkilöä ei löydy');
        });
    });
});
