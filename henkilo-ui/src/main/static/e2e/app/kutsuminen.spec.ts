import { test, expect } from '@playwright/test';

import { gotoKutsuminen } from './locators/kutsuminen-page';

import henkilo from '../../mock-api/src/api/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.00000000007/GET.json';
import { toastWithText } from '../locators';

test.describe('kutsuminen', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('/oppijanumerorekisteri-service/henkilo/1.2.246.562.24.00000000007', async (route) => {
            await route.fulfill({
                json: {
                    ...henkilo,
                    yksiloityVTJ: true,
                    hetu: '121212-1234',
                },
            });
        });
    });

    test('happy path', async ({ page }) => {
        const { confirmation, form, organisations, submit, validationBanner } = await gotoKutsuminen(page);

        await expect(validationBanner).toContainText('Täytä kaikki kentät');
        await expect(validationBanner).toContainText('Valitse organisaatio sekä vähintään yksi käyttöoikeusryhmä');

        await form.etunimi.fill('etunimi');
        await form.sukunimi.fill('sukunimi');

        await form.email.fill('email');
        await expect(validationBanner).toContainText('Virheellinen sähköposti');
        await form.email.fill('email@email.fi');
        await expect(validationBanner).not.toContainText('Virheellinen sähköposti');

        await form.kieliSelect.select('ruotsi');
        await expect(validationBanner).not.toContainText('Täytä kaikki kentät');

        await form.viesti.fill('saate');

        await organisations.add.click();
        await organisations.get(0).organisaatio.select('aliorg');
        await organisations.get(0).kayttooikeus.click();
        await organisations.get(0).modal.kayttooikeus('rajapintakäyttäjä').click();
        await organisations.get(0).modal.lisaa.click();
        await organisations.get(0).modal.kayttooikeus('tallentaja').click();
        await organisations.get(0).modal.lisaa.click();
        await organisations.get(0).modal.close.click();

        await organisations.add.click();
        await organisations.get(1).ryhma.select('ryhma');
        await organisations.get(1).kayttooikeus.click();
        await organisations.get(1).modal.kayttooikeus('tallentaja').click();
        await organisations.get(1).modal.lisaa.click();
        await organisations.get(1).modal.close.click();

        await expect(validationBanner).not.toBeAttached();
        await submit.click();

        await expect(confirmation.content).toContainText('aliorgrajapintakäyttäjä tallentaja');
        await expect(confirmation.content).toContainText('ryhma1tallentaja');

        await page.route('/kayttooikeus-service/kutsu', async (route, request) => {
            const j = request.postDataJSON();
            if (j.asiointikieli !== 'sv' || j.etunimi !== 'etunimi' || j.sukunimi !== 'sukunimi') {
                throw new Error('Invalid request!');
            }
            await route.fulfill({
                json: '2356425',
            });
        });

        await confirmation.submit.click();
        await expect(toastWithText(page, 'Kutsu lähetetty')).toBeVisible();
    });
});
